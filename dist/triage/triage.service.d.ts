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
export declare class TriageService {
    private readonly webhookUrl;
    private readonly timeoutMs;
    private readonly maxAttempts;
    triage(body: TriageRequest): Promise<TriageResponse>;
    private callN8n;
    private buildFallback;
    private validatePayload;
    private sleep;
}
export {};
