import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TriageModuleModule } from './triage/triage-module.module';

@Module({
  imports: [TriageModuleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
