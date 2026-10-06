import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Res,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentsDto } from './dto/create-assignments.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidateFile } from 'src/common/decorators/validate-file.decorator';
import { ValidateFileInterceptor } from 'src/common/interceptors/validate-file.interceptor';
import { multerConfigMemoryOnly } from 'src/common/config/multer.config';
import { flashToast } from 'src/common/utils/toast.util';

@UseGuards(AuthenticatedGuard)
@Controller('task')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Roles('admin')
  @Post(':sessionId')
  @UseInterceptors(
    FileInterceptor('file', multerConfigMemoryOnly),
    ValidateFileInterceptor,
  )
  @ValidateFile({
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['application/pdf'],
    fileExtensions: ['.pdf'],
    folder: 'assignments',
    resourceType: 'raw',
  })
  async create(
    @Body() createAssignmentDto: CreateAssignmentsDto,
    @UploadedFile() file: Express.Multer.File,
    @Param('sessionId') sessionId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const uploaded = (req.body as { uploadedFileUrls?: string[] })
        ?.uploadedFileUrls;
      if (!uploaded || !uploaded[0]) {
        throw new Error('File upload failed. Please try again.');
      }

      createAssignmentDto.sessionId = sessionId;
      createAssignmentDto.file = uploaded[0];
      await this.assignmentsService.create(createAssignmentDto);
      flashToast(
        req,
        'Assignment Created',
        'The new assignment has been added to this session.',
      );
      res.redirect(`/session/${sessionId}`);
    } catch (error: unknown) {
      const err = error as Error;
      const errorMessage = err.message || 'Failed to create assignment';
      req.flash('error', errorMessage);
      res.redirect(`/session/${sessionId}`);
    }
  }

  @Roles('admin')
  @Get('formCreate/:sessionId')
  formCreate(
    @Res() res: Response,
    @Req() req: Request,
    @Param('sessionId') sessionId: string,
  ) {
    res.render('admin/assignments/create', { user: req.user, sessionId });
  }

  @Roles('admin')
  @Delete(':assignmentId/:sessionId')
  async remove(
    @Param('sessionId') sessionId: string,
    @Param('assignmentId') assignmentId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const assignments = await this.assignmentsService.findOne(assignmentId);
      await this.assignmentsService.deleteFile(assignments.file);
      await this.assignmentsService.remove(assignmentId);
      flashToast(
        req,
        'Assignment Deleted',
        'The assignment has been permanently removed.',
      );
      res.redirect(`/session/${sessionId}`);
    } catch (error: unknown) {
      const err = error as Error;
      req.flash('error', err.message || 'unsuccess delete assignment');
      res.redirect(`/session/${sessionId}`);
    }
  }
}
