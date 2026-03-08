import {
    GatewayTimeoutException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';

type TriageRequest = {
    symptoms: string[];
    patientInfo?: {
        age?: number;
        gender?: string;
        [key: string]: unknown;
    };
    additionalNotes?: string;
};

type TriageResult = {
    classification: 'EMERGENCIA' | 'URGENTE' | 'PRIORITARIO' | 'NAO_URGENTE';
    severity_score: number;
    analysis: string;
    recommendations: string[];
    red_flags: string[];
    suggested_specialty: string;
    requires_immediate_attention: boolean;
};

type TriageResponse = {
    success: boolean;
    timestamp: string;
    triage_result: TriageResult;
    metadata: {
        source: 'n8n' | 'fallback';
        latency_ms: number;
        attempts: number;
    };
};

@Injectable()
export class TriageService {
    private readonly webhookUrl =
        process.env.N8N_WEBHOOK_URL ?? 'https://darkoyster-n8n.cloudfy.live/webhook/medical-triage';
    private readonly timeoutMs = Number(process.env.N8N_TIMEOUT_MS ?? 3500);
    private readonly maxAttempts = Number(process.env.N8N_MAX_ATTEMPTS ?? 2);

    async triage(body: TriageRequest): Promise<TriageResponse> {
        const startedAt = Date.now();

        this.validatePayload(body);

        console.log('[TriageService] Chamando n8n webhook:', this.webhookUrl);

        let lastError: unknown;
        for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
            try {
                const data = await this.callN8n(body, this.timeoutMs);
                console.log('[TriageService] Sucesso na tentativa', attempt);
                return {
                    ...data,
                    metadata: {
                        source: 'n8n',
                        latency_ms: Date.now() - startedAt,
                        attempts: attempt,
                    },
                };
            } catch (error) {
                console.error(`[TriageService] Erro na tentativa ${attempt}:`, error);
                lastError = error;
                if (attempt < this.maxAttempts) {
                    await this.sleep(80 * attempt);
                }
            }
        }

        // Fallback rapido para manter boa experiencia mesmo com n8n indisponivel.
        const fallback = this.buildFallback(startedAt, this.maxAttempts);

        if (process.env.TRIAGE_STRICT_MODE === 'true') {
            const isTimeout =
                lastError instanceof Error && lastError.name === 'AbortError';
            if (isTimeout) {
                throw new GatewayTimeoutException('Timeout ao consultar o workflow de triagem');
            }
            throw new InternalServerErrorException('Falha ao consultar o workflow de triagem');
        }

        return fallback;
    }

    private async callN8n(body: TriageRequest, timeoutMs: number): Promise<TriageResponse> {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const res = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Connection: 'keep-alive',
                },
                body: JSON.stringify(body),
                signal: controller.signal,
            });

            console.log('[TriageService] Status HTTP:', res.status);
            console.log('[TriageService] Headers:', Object.fromEntries(res.headers.entries()));

            const responseText = await res.text();
            console.log('[TriageService] Corpo da resposta:', responseText.substring(0, 500));

            if (!res.ok) {
                throw new Error(`n8n respondeu com status ${res.status}: ${responseText}`);
            }

            if (!responseText || responseText.trim() === '') {
                throw new Error('n8n retornou corpo vazio');
            }

            return JSON.parse(responseText) as TriageResponse;
        } finally {
            clearTimeout(timeout);
        }
    }

    private buildFallback(startedAt: number, attempts: number): TriageResponse {
        return {
            success: true,
            timestamp: new Date().toISOString(),
            triage_result: {
                classification: 'PRIORITARIO',
                severity_score: 5,
                analysis:
                    'Sistema de triagem automatica indisponivel no momento. Recomenda-se avaliacao medica presencial.',
                recommendations: ['Consultar clinico geral nas proximas horas'],
                red_flags: ['Analise automatica indisponivel'],
                suggested_specialty: 'Clinico Geral',
                requires_immediate_attention: false,
            },
            metadata: {
                source: 'fallback',
                latency_ms: Date.now() - startedAt,
                attempts,
            },
        };
    }

    private validatePayload(body: TriageRequest): void {
        if (!body || !Array.isArray(body.symptoms) || body.symptoms.length === 0) {
            throw new InternalServerErrorException(
                'Payload invalido: informe ao menos um sintoma em symptoms[]',
            );
        }
    }

    private async sleep(ms: number): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, ms));
    }

}
