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
import { AttendanceService } from './attendances.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Roles('user')
  @Post(':sessionId/:userId/:courseId')
  async create(
    @Param('sessionId') sessionId: number,
    @Param('courseId') courseId: number,
    @Param('userId') userId: number,
    @Res() res: Response,
    @Body() createAttendanceDto: CreateAttendanceDto,
    @Req() req: Request,
  ) {
    try {
      createAttendanceDto.sessionId = sessionId;
      createAttendanceDto.userId = userId;
      createAttendanceDto.attendanceTime = new Date();
      await this.attendanceService.create(createAttendanceDto);
      req.flash('success', 'Successfully submitted attendance');
      res.redirect(`/program/${courseId}`);
    } catch (error: any) {
      req.flash(
        'error',
        error.message ||
          'You have already submitted attendance for this meeting',
      );
      res.redirect(`/program/${courseId}`);
    }
  }

  @Roles('admin')
  @Post(':sessionId')
  async createAttendance(
    @Param('sessionId') sessionId: number,
    @Res() res: Response,
    @Body() createAttendanceDto: CreateAttendanceDto,
    @Req() req: Request,
  ) {
    try {
      createAttendanceDto.sessionId = sessionId;
      await this.attendanceService.create(createAttendanceDto);
      req.flash('success', 'Successfully added attendance');
      res.redirect(`/session/${sessionId}`);
    } catch (error: any) {
      req.flash(
        'error',
        'Failed to add attendance, user has already submitted attendance for this session',
      );
      res.redirect(`/session/${sessionId}`);
    }
  }

  @Roles('user')
  @Get('form/:id')
  async formAttendance(
    @Res() res: Response,
    @Param('id') id: number,
    @Req() req: Request,
  ) {
    const session = await this.attendanceService.findSession(id);
    res.render('user/attendance/create', { session, user: req.user });
  }

  @Roles('admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: any) {
    const attendance = await this.attendanceService.findAll();
    res.render('admin/attendance/index', { user: req.user, attendance });
  }

  @Roles('admin')
  @Get('create/:sessionId')
  async attendanceCreate(
    @Res() res: Response,
    @Req() req: Request,
    @Param('sessionId') sessionId: number,
  ) {
    const users = await this.attendanceService.findUsers(sessionId);
    res.render('admin/attendance/create', { user: req.user, users, sessionId });
  }

  @Roles('admin')
  @Get(':id')
  async findOne(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: any,
  ) {
    const attendance = await this.attendanceService.findOne(id);
    res.render('admin/attendance/detail', { user: req.user, attendance });
  }

  @Roles('admin')
  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const attendance = await this.attendanceService.findOne(id);
    res.render('admin/attendance/edit', { user: req.user, attendance });
  }

  @Roles('admin')
  @Patch(':attendanceId/:sessionId')
  async update(
    @Param('sessionId') sessionId: number,
    @Param('attendanceId') attendanceId: number,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.attendanceService.update(attendanceId, updateAttendanceDto);
      req.flash('success', 'Successfully updated attendance');
      res.redirect(`/session/${sessionId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to update attendance');
      res.redirect(`/session/${sessionId}`);
    }
  }

  @Roles('admin')
  @Delete(':attendanceId/:sessionId')
  async remove(
    @Param('attendanceId') attendanceId: number,
    @Param('sessionId') sessionId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.attendanceService.remove(attendanceId, sessionId);
      req.flash('success', 'Successfully delete attendace');
      res.redirect(`/session/${sessionId}`);
    } catch (error: any) {
      req.flash('error', error.message || 'Failed to delete attendance');
      res.redirect(`/session/${sessionId}`);
    }
  }
}
