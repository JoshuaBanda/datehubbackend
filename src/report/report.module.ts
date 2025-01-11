import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { EmailService } from 'src/email/email.service';
import { EmailModule } from 'src/email/email.module';

@Module({
  controllers: [ReportController],
  providers: [ReportService,EmailService],
})
export class ReportModule {}
