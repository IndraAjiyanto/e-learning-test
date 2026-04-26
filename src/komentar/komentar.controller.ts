import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { KomentarService } from './komentar.service';
import { CreateKomentarDto } from './dto/create-komentar.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('komentar')
export class KomentarController {
  constructor(private readonly komentarService: KomentarService) {}

  @Roles('admin')
  @Post(':tugasId/:jawaban_tugasId')
  async create(
    @Param('tugasId') tugasId: number,
    @Param('jawaban_tugasId') jawaban_tugasId: number,
    @Body() createKomentarDto: CreateKomentarDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      createKomentarDto.jawaban_tugasId = jawaban_tugasId;
      await this.komentarService.create(createKomentarDto);
      await this.komentarService.updateJawabanTugas(
        jawaban_tugasId,
        createKomentarDto.proses,
      );
      req.flash('success', 'comment successfuly send');
      res.redirect(`/answer-assigment/${tugasId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'comment unsuccess send');
      res.redirect(`/answer-assigment/${tugasId}`);
    }
  }
}
