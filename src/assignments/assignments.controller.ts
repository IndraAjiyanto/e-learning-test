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

@UseGuards(AuthenticatedGuard)
@Controller('task')
export class AssignmentsController {
  constructor(private readonly tugassService: AssignmentsService) {}

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
    @Body() createTugassDto: CreateAssignmentsDto,
    @UploadedFile() file: Express.Multer.File,
    @Param('sessionId') sessionId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      if (!req.body.uploadedFileUrls || !req.body.uploadedFileUrls[0]) {
        throw new Error('File upload failed. Please try again.');
      }

      createTugassDto.sessionId = sessionId;
      createTugassDto.file = req.body.uploadedFileUrls[0];
      await this.tugassService.create(createTugassDto);
      req.flash('success', 'Assignment successfully created');
      res.redirect(`/session/${sessionId}`);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create assignment';
      req.flash('error', errorMessage);
      res.redirect(`/session/${sessionId}`);
    }
  }

  @Roles('admin')
  @Get('formCreate/:sessionId')
  async formCreate(
    @Res() res: Response,
    @Req() req: Request,
    @Param('sessionId') sessionId: number,
  ) {
    res.render('admin/assignments/create', { user: req.user, sessionId });
  }

  @Roles('admin')
  @Delete(':tugasId/:sessionId')
  async remove(
    @Param('sessionId') sessionId: number,
    @Param('tugasId') tugasId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const assignments = await this.tugassService.findOne(tugasId);
      await this.tugassService.deleteFile(assignments.file);
      await this.tugassService.remove(tugasId);
      req.flash('success', 'successfuly delete assignment');
      res.redirect(`/session/${sessionId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'unsuccess delete assignment');
      res.redirect(`/session/${sessionId}`);
    }
  }
}
