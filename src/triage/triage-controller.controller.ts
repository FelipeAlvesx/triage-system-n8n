import { Controller, Post } from '@nestjs/common';

@Controller('triage-controller')
export class TriageControllerController {


    @Post()
    async triage() {
        return "triage";
    }


}
