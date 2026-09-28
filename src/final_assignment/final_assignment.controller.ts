import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FinalAssignmentService } from './final_assignment.service';
import { ReviewUserAssignmentDto } from './dto/review-user-assignment.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { flashToast } from 'src/common/utils/toast.util';

@Controller('final-assignment')
export class FinalAssignmentController {
  constructor(
    private readonly finalAssignmentService: FinalAssignmentService,
  ) {}

  @Roles('admin', 'super_admin', 'user')
  @Get('course/:courseId')
  async getByCourse(
    @Param('courseId') courseId: string,
    @Res() res: Response,
  ) {
    const finalAssignment = await this.finalAssignmentService.findByCourse(
      courseId,
      false,
    );
    return res.json({
      success: true,
      data: finalAssignment,
    });
  }

  @Roles('admin', 'super_admin')
  @Post('delete/:courseId')
  async delete(
    @Param('courseId') courseId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.finalAssignmentService.remove(courseId);
    flashToast(
      req,
      'Final Assignment Deleted',
      'The final assignment has been removed successfully.',
    );
    return res.redirect(`/program/detail/program/admin/${courseId}`);
  }

  @Roles('admin', 'super_admin')
  @Post('submission/:id/review')
  @HttpCode(HttpStatus.OK)
  async reviewSubmission(
    @Param('id') submissionId: string,
    @Body() dto: ReviewUserAssignmentDto,
    @Req() req: Request,
  ) {
    const updated = await this.finalAssignmentService.reviewSubmission(
      submissionId,
      dto.status,
      dto.comment,
      req.user,
    );
    return {
      success: true,
      message: `Submission status updated to ${dto.status}.`,
      data: updated,
    };
  }
}

