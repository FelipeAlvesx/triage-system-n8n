import { Module } from '@nestjs/common';
import { TriageControllerController } from './triage-controller.controller';
import { TriageServiceService } from './triage-service.service';

@Module({
  controllers: [TriageControllerController],
  providers: [TriageServiceService]
})
export class TriageModuleModule {}
