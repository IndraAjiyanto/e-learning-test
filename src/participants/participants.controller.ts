import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { CreateParticipantsDto } from './dto/create-participants.dto';
import { UpdateParticipantsDto } from './dto/update-participants.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Roles('super_admin')
  @Post(':courseId')
  async create(
    @Param('courseId') courseId: string,
    @Body() createParticipantsDto: CreateParticipantsDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      createParticipantsDto.courseId = courseId;
      await this.participantsService.create(createParticipantsDto);
      req.flash('success', 'Participant successfully created');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Participant failed to create');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }

  @Roles('super_admin')
  @Get('formCreate/:courseId')
  async formCreateWithKelas(
    @Res() res: Response,
    @Req() req: Request,
    @Param('courseId') courseId: string,
  ) {
    res.render('super_admin/participants/create', { user: req.user, courseId });
  }

  @Roles('super_admin')
  @Get('formEdit/:participantId')
  async formEdit(
    @Param('participantId') participantId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const participant = await this.participantsService.findOne(participantId);
    res.render('super_admin/participants/edit', {
      user: req.user,
      participant,
    });
  }

  @Roles('super_admin')
  @Patch(':participantId/:courseId')
  async update(
    @Param('participantId') participantId: string,
    @Param('courseId') courseId: string,
    @Body() updateParticipantsDto: UpdateParticipantsDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.participantsService.update(
        participantId,
        updateParticipantsDto,
      );
      req.flash('success', 'Participant successfully updated');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Participant failed to update');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }

  @Roles('super_admin')
  @Delete(':participantId/:courseId')
  async remove(
    @Param('participantId') participantId: string,
    @Param('courseId') courseId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const participant = await this.participantsService.findOne(participantId);
      if (!participant) {
        req.flash('error', 'Participant not found');
      }
      await this.participantsService.remove(participantId);
      req.flash('success', 'Participant successfully deleted');
      res.redirect(`/program/detail/program/admin/${courseId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Participant failed to delete');

      res.redirect(`/program/detail/program/admin/${courseId}`);
    }
  }
}
