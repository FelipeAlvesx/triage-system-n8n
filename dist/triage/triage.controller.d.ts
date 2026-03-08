import { TriageService } from './triage.service';
export declare class TriageController {
    private readonly triageService;
    constructor(triageService: TriageService);
    triage(body: any): Promise<{
        success: boolean;
        timestamp: string;
        triage_result: {
            classification: "EMERGENCIA" | "URGENTE" | "PRIORITARIO" | "NAO_URGENTE";
            severity_score: number;
            analysis: string;
            recommendations: string[];
            red_flags: string[];
            suggested_specialty: string;
            requires_immediate_attention: boolean;
        };
        metadata: {
            source: "n8n" | "fallback";
            latency_ms: number;
            attempts: number;
        };
    }>;
}
