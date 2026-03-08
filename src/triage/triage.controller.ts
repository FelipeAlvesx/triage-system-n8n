import { Body, Controller, Post } from '@nestjs/common';
import { TriageService } from './triage.service';

@Controller('triage')
export class TriageController {

    constructor(private readonly triageService: TriageService) { }

    @Post()
    async triage(@Body() body: any) {    
        return await this.triageService.triage(body);
    }

}
