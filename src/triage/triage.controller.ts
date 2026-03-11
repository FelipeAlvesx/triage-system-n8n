import { Body, Controller, Post } from '@nestjs/common';
import { TriageService } from './triage.service';
import { TriageDto } from '../dtos/triage.dto';

@Controller('triage')
export class TriageController {

    constructor(private readonly triageService: TriageService) { }

    @Post()
    async triage(@Body() body: TriageDto) {    
        return await this.triageService.triage(body);
    }

}
