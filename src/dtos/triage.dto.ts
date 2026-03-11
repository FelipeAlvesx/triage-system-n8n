import { IsNotEmptyObject } from "class-validator";



export class TriageDto {

    @IsNotEmptyObject()
    symptoms: string[];
    
    @IsNotEmptyObject()
    patientInfo: {
        age?: number;
        gender?: string;
        [key: string]: unknown;
    };
    additionalNotes?: string;
}