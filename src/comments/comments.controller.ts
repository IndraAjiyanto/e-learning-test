import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentsDto } from './dto/create-comments.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly komentarService: CommentsService) {}

  @Roles('admin')
  @Post(':assignmentId/:assignment_answerId')
  async create(
    @Param('assignmentId') assignmentId: number,
    @Param('assignment_answerId') assignment_answerId: number,
    @Body() createKomentarDto: CreateCommentsDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      createKomentarDto.answerTaskId = assignment_answerId;
      await this.komentarService.create(createKomentarDto);
      await this.komentarService.updateJawabanTugas(
        assignment_answerId,
        createKomentarDto.process,
      );
      req.flash('success', 'comment successfuly send');
      res.redirect(`/answer-assigment/${assignmentId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'comment unsuccess send');
      res.redirect(`/answer-assigment/${assignmentId}`);
    }
  }
}
