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
import { AttendanceService } from './attendance.service';
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
  @Post(':pertemuanId/:userId/:kelasId')
  async create(
    @Param('pertemuanId') pertemuanId: number,
    @Param('kelasId') kelasId: number,
    @Param('userId') userId: number,
    @Res() res: Response,
    @Body() createAttendanceDto: CreateAttendanceDto,
    @Req() req: Request,
  ) {
    try {
      createAttendanceDto.pertemuanId = pertemuanId;
      createAttendanceDto.userId = userId;
      createAttendanceDto.time_attendance = new Date();
      await this.attendanceService.create(createAttendanceDto);
      req.flash('success', 'Successfully submitted attendance');
      res.redirect(`/kelass/${kelasId}`);
    } catch (error) {
      req.flash(
        'error',
        error.message ||
          'You have already submitted attendance for this meeting',
      );
      res.redirect(`/kelass/${kelasId}`);
    }
  }

  @Roles('admin')
  @Post(':pertemuanId')
  async createAttendance(
    @Param('pertemuanId') pertemuanId: number,
    @Res() res: Response,
    @Body() createAttendanceDto: CreateAttendanceDto,
    @Req() req: Request,
  ) {
    try {
      createAttendanceDto.pertemuanId = pertemuanId;
      await this.attendanceService.create(createAttendanceDto);
      req.flash('success', 'Successfully added attendance');
      res.redirect(`/pertemuans/${pertemuanId}`);
    } catch (error) {
      req.flash(
        'error',
        'Failed to add attendance, user has already submitted attendance for this session',
      );
      res.redirect(`/pertemuans/${pertemuanId}`);
    }
  }

  @Roles('user')
  @Get('form/:pertemuanId')
  async formAttendance(
    @Res() res: Response,
    @Param('pertemuanId') pertemuanId: number,
    @Req() req: Request,
  ) {
    const pertemuan = await this.attendanceService.findPertemuan(pertemuanId);
    res.render('user/attendance/create', { pertemuan, user: req.user });
  }

  @Roles('admin')
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const attendance = await this.attendanceService.findAll();
    res.render('admin/attendance/index', { user: req.user, attendance });
  }

  @Roles('admin')
  @Get('create/:pertemuanId')
  async attendanceCreate(
    @Res() res: Response,
    @Req() req: Request,
    @Param('pertemuanId') pertemuanId: number,
  ) {
    const users = await this.attendanceService.findUsers(pertemuanId);
    res.render('admin/attendance/create', { user: req.user, users, pertemuanId });
  }

  @Roles('admin')
  @Get(':attendanceId')
  async findOne(
    @Param('attendanceId') attendanceId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const attendance = await this.attendanceService.findOne(attendanceId);
    res.render('admin/attendance/detail', { user: req.user, attendance });
  }

  @Roles('admin')
  @Get('formEdit/:attendanceId')
  async formEdit(
    @Param('attendanceId') attendanceId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const attendance = await this.attendanceService.findOne(attendanceId);
    res.render('admin/attendance/edit', { user: req.user, attendance });
  }

  @Roles('admin')
  @Patch(':attendanceId/:pertemuanId')
  async update(
    @Param('pertemuanId') pertemuanId: number,
    @Param('attendanceId') attendanceId: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.attendanceService.update(attendanceId, updateAttendanceDto);
      req.flash('success', 'Successfully updated attendance');
      res.redirect(`/pertemuans/${pertemuanId}`);
    } catch (error) {
      req.flash('error', error.message || 'Failed to update attendance');
      res.redirect(`/pertemuans/${pertemuanId}`);
    }
  }

  @Roles('admin')
  @Delete(':attendanceId/:pertemuanId')
  async remove(
    @Param('attendanceId') attendanceId: string,
    @Param('pertemuanId') pertemuanId: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.attendanceService.remove(attendanceId, pertemuanId);
      req.flash('success', 'Successfully deleted attendance');
      res.redirect(`/pertemuans/${pertemuanId}`);
    } catch (error) {
      req.flash('error', error.message || 'Failed to delete attendance');
      res.redirect(`/pertemuans/${pertemuanId}`);
    }
  }
}
