import { Body, Controller, Delete, Get, HttpException, HttpStatus, NotFoundException, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { insertReport, selectReport } from 'src/db/schema';;
import { CreateReportDto } from './dto/create-report.dto'; // Assuming you have a DTO for report creation
import { JwtAuthGuard } from 'src/posts/guard';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // Create a new report
  @UseGuards(JwtAuthGuard) // Protect route with JWT guard
  @Post('create')
  async createReport(@Body() createReportDto: CreateReportDto, @Req() req): Promise<any> {
    const userId = req.user?.sub; // Extract the user ID from JWT token
    
    if (!userId) {
      throw new HttpException('User ID is required to create a report', HttpStatus.BAD_REQUEST);
    }

    try {
      const reportData: insertReport = {
        ...createReportDto,
        reportedby: userId,
      };
      const createdReport = await this.reportService.createReport(reportData);
      return { message: 'Report created successfully', report: createdReport };
    } catch (error) {
      throw new HttpException('Failed to create report', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get all reports
  @UseGuards(JwtAuthGuard) // Protect route with JWT guard
  @Get()
  async getAllReports(@Req() req): Promise<selectReport[]> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new HttpException('User ID is required to fetch reports', HttpStatus.BAD_REQUEST);
    }

    try {
      const reports = await this.reportService.getAllReports();
      return reports;
    } catch (error) {
      throw new HttpException('Failed to fetch reports', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get a specific report by ID
  @Get(':id')
  async getReportById(@Param('id') id: number): Promise<selectReport | null> {
    try {
      const report = await this.reportService.getReportById(id);
      if (!report) {
        throw new NotFoundException('Report not found');
      }
      return report;
    } catch (error) {
      throw new HttpException('Failed to fetch report', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get reports by user (either as reportedby or offender)
  /*@Get('user/:userId')
  async getReportsByUser(@Param('userId') userId: number): Promise<selectReport[]> {
    try {
      const reports = await this.reportService.getReportsByUser(userId);
      if (!reports || reports.length === 0) {
        throw new NotFoundException('No reports found for this user');
      }
      return reports;
    } catch (error) {
      throw new HttpException('Failed to fetch reports for user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
    */

  // Delete a report by ID
  @UseGuards(JwtAuthGuard) // Protect route with JWT guard
  @Delete(':id')
  async deleteReport(@Param('id') id: number): Promise<any> {
    try {
      const deleted = await this.reportService.deleteReport(id);

      return { message: 'Report deleted successfully' };
    } catch (error) {
      throw new HttpException('Failed to delete report', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
 