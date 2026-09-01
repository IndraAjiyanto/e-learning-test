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
import { VoucherService } from './voucher.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request, Response } from 'express';

@UseGuards(AuthenticatedGuard)
@Roles('super_admin')
@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  // ─── LIST ─────────────────────────────────────────────────────────────────

  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    const vouchersRaw = await this.voucherService.findAll();
    const allUsers = await this.voucherService.findAllUsers();

    const vouchers = vouchersRaw.map((v) => {
      let targetLabel = 'Public (All Users)';
      if (v.allowed_user_ids && v.allowed_user_ids.length > 0) {
        const allowedNames = v.allowed_user_ids.map((id) => {
          const u = allUsers.find((user) => user.id === id);
          return u ? u.username : `ID:${id}`;
        });
        targetLabel = allowedNames.join(', ');
      }
      return { ...v, target_users_label: targetLabel };
    });

    res.render('super_admin/voucher/index', {
      user: req.user,
      vouchers,
      success: req.flash('success')[0],
      error: req.flash('error')[0],
    });
  }

  // ─── FORM CREATE ──────────────────────────────────────────────────────────

  @Get('formCreate')
  async formCreate(@Res() res: Response, @Req() req: Request) {
    // Kirim semua program ke view untuk ditampilkan di search-select Alpine.js
    const courses = await this.voucherService.findAllCourses();
    const users = await this.voucherService.findAllUsers();
    res.render('super_admin/voucher/create', {
      user: req.user,
      courses,
      users,
      error: req.flash('error')[0],
    });
  }

  // ─── PROSES CREATE ────────────────────────────────────────────────────────

  @Post()
  async create(
    @Body() createVoucherDto: CreateVoucherDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.voucherService.create(createVoucherDto);
      req.flash('success', 'Voucher berhasil dibuat');
      res.redirect('/voucher');
    } catch (error: any) {
      console.error(
        'CREATE VOUCHER ERROR:',
        error.message,
        error.detail || error,
      );
      req.flash('error', error.message || 'Voucher gagal dibuat');
      res.redirect('/voucher/formCreate');
    }
  }

  // ─── FORM EDIT ────────────────────────────────────────────────────────────

  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      // voucher.courses sudah di-load untuk pre-fill search-select
      const voucher = await this.voucherService.findOne(id);
      const courses = await this.voucherService.findAllCourses();
      const users = await this.voucherService.findAllUsers();
      res.render('super_admin/voucher/edit', {
        user: req.user,
        voucher,
        courses,
        users,
        error: req.flash('error')[0],
      });
    } catch (error: any) {
      req.flash('error', error.message || 'Voucher tidak ditemukan');
      res.redirect('/voucher');
    }
  }

  // ─── PROSES UPDATE ────────────────────────────────────────────────────────

  // Browser POST ke /voucher/:id?_method=PATCH
  // Middleware method-override mengubahnya menjadi PATCH sebelum sampai sini
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateVoucherDto: UpdateVoucherDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.voucherService.update(id, updateVoucherDto);
      req.flash('success', 'Voucher berhasil diperbarui');
      res.redirect('/voucher');
    } catch (error: any) {
      req.flash('error', error.message || 'Voucher gagal diperbarui');
      res.redirect(`/voucher/formEdit/${id}`);
    }
  }

  // ─── PROSES DELETE ────────────────────────────────────────────────────────

  // Browser POST ke /voucher/:id?_method=DELETE
  // Middleware method-override mengubahnya menjadi DELETE sebelum sampai sini
  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.voucherService.remove(id);
      req.flash('success', 'Voucher berhasil dihapus');
      res.redirect('/voucher');
    } catch (error: any) {
      req.flash('error', error.message || 'Voucher gagal dihapus');
      res.redirect('/voucher');
    }
  }
}
