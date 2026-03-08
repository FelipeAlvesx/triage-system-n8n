"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriageService = void 0;
const common_1 = require("@nestjs/common");
let TriageService = class TriageService {
    webhookUrl = process.env.N8N_WEBHOOK_URL ?? 'https://darkoyster-n8n.cloudfy.live/webhook/medical-triage';
    timeoutMs = Number(process.env.N8N_TIMEOUT_MS ?? 3500);
    maxAttempts = Number(process.env.N8N_MAX_ATTEMPTS ?? 2);
    async triage(body) {
        const startedAt = Date.now();
        this.validatePayload(body);
        console.log('[TriageService] Chamando n8n webhook:', this.webhookUrl);
        let lastError;
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
            }
            catch (error) {
                console.error(`[TriageService] Erro na tentativa ${attempt}:`, error);
                lastError = error;
                if (attempt < this.maxAttempts) {
                    await this.sleep(80 * attempt);
                }
            }
        }
        const fallback = this.buildFallback(startedAt, this.maxAttempts);
        if (process.env.TRIAGE_STRICT_MODE === 'true') {
            const isTimeout = lastError instanceof Error && lastError.name === 'AbortError';
            if (isTimeout) {
                throw new common_1.GatewayTimeoutException('Timeout ao consultar o workflow de triagem');
            }
            throw new common_1.InternalServerErrorException('Falha ao consultar o workflow de triagem');
        }
        return fallback;
    }
    async callN8n(body, timeoutMs) {
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
            return JSON.parse(responseText);
        }
        finally {
            clearTimeout(timeout);
        }
    }
    buildFallback(startedAt, attempts) {
        return {
            success: true,
            timestamp: new Date().toISOString(),
            triage_result: {
                classification: 'PRIORITARIO',
                severity_score: 5,
                analysis: 'Sistema de triagem automatica indisponivel no momento. Recomenda-se avaliacao medica presencial.',
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
    validatePayload(body) {
        if (!body || !Array.isArray(body.symptoms) || body.symptoms.length === 0) {
            throw new common_1.InternalServerErrorException('Payload invalido: informe ao menos um sintoma em symptoms[]');
        }
    }
    async sleep(ms) {
        await new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.TriageService = TriageService;
exports.TriageService = TriageService = __decorate([
    (0, common_1.Injectable)()
], TriageService);
//# sourceMappingURL=triage.service.js.map