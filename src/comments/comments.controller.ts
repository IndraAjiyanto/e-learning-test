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
  @Post(':tugasId/:jawaban_tugasId')
  async create(
    @Param('tugasId') tugasId: number,
    @Param('jawaban_tugasId') jawaban_tugasId: number,
    @Body() createKomentarDto: CreateCommentsDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      createKomentarDto.answerTaskId = jawaban_tugasId;
      await this.komentarService.create(createKomentarDto);
      await this.komentarService.updateJawabanTugas(
        jawaban_tugasId,
        createKomentarDto.process,
      );
      req.flash('success', 'comment successfuly send');
      res.redirect(`/answer-assigment/${tugasId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'comment unsuccess send');
      res.redirect(`/answer-assigment/${tugasId}`);
    }
  }
}
