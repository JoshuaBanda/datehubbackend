import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from 'src/db';
import { insertReport, reportTable, selectReport } from 'src/db/schema';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class ReportService {
  // Inject EmailService into ReportService
  constructor(private readonly emailService: EmailService) {}

  // Create a new report
  async createReport(report: insertReport): Promise<selectReport> {
    try {
      console.log("Report data being passed:", report);
  
      // Insert the report into the database and return the inserted row
      const [newReport] = await db
        .insert(reportTable)
        .values(report)
        .returning();  // Fetch all columns of the newly inserted report
  
      console.log("New Report Created:", newReport);
  
      // Destructure correctly based on the schema column names
      const { reportMessage, reportedby, offender, postid } = newReport;
      
      // Assuming you have the email of the admin stored somewhere
      const adminEmail = 'bsc-inf-04-22@unima.ac.mw';  // Replace this with actual admin email
      
      // Call sendReportEmail to notify the admin
      await this.emailService.sendReportEmail(adminEmail, reportMessage, offender, reportedby, postid);
      
      return newReport;
    } catch (error) {
      // Detailed logging for the error
      console.log("Error during report creation:", error);
      console.log("Error message:", error.message);
  
      throw new InternalServerErrorException(`Failed to create report: ${error.message}`);
    }
  }
  
  // Get a report by its ID
  async getReportById(reportId: number): Promise<selectReport | null> {
    try {
      const report = await db
        .select()
        .from(reportTable)
        .where(eq(reportTable.id, reportId))
        .limit(1)
        .execute();

      return report.length > 0 ? report[0] : null;
    } catch (error) {
      throw new Error(`Failed to get report: ${error.message}`);
    }
  }

  // Get all reports
  async getAllReports(): Promise<selectReport[]> {
    try {
      const reports = await db
        .select()
        .from(reportTable)
        .execute();

      return reports;
    } catch (error) {
      throw new Error(`Failed to retrieve reports: ${error.message}`);
    }
  }

  // Update a report by its ID
  async updateReport(reportId: number, reportData: Partial<insertReport>): Promise<selectReport | null> {
    try {
      const [updatedReport] = await db
        .update(reportTable)
        .set(reportData)
        .where(eq(reportTable.id, reportId))
        .returning();

      return updatedReport || null;
    } catch (error) {
      throw new Error(`Failed to update report: ${error.message}`);
    }
  }

  // Delete a report by its ID
  async deleteReport(reportId: number): Promise<void> {
    try {
      const result = await db
        .delete(reportTable)
        .where(eq(reportTable.id, reportId))
        .execute();

      if (result.count === 0) {
        throw new Error(`Report with ID ${reportId} not found`);
      }
      
    } catch (error) {
      throw new Error(`Failed to delete report: ${error.message}`);
    }
  }
}

