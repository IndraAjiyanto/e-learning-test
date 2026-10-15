import {
  ConflictException,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
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
import { flashToast, flashToastError } from 'src/common/utils/toast.util';

@UseGuards(AuthenticatedGuard)
@Roles('super_admin')
@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  // Deteksi konflik kode voucher, baik yang dilempar service (ConflictException)
  // maupun pelanggaran unique constraint DB yang lolos dari pre-check karena
  // balapan (dua submit hampir bersamaan).
  private isDuplicateCode(error: unknown): boolean {
    if (error instanceof ConflictException) return true;
    const err = error as { message?: string; detail?: string };
    return (
      /code_voucher/i.test(err?.detail ?? '') ||
      /duplicate key value/i.test(err?.message ?? '')
    );
  }

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
      error: req.flash('error')[0],
    });
  }

  // ─── FORM CREATE ──────────────────────────────────────────────────────────

  // Cek ketersediaan kode sebelum form disubmit. Dipanggil dari Alpine saat
  // super admin mengetik/meninggalkan field kode, supaya konflik terlihat
  // sebelum tombol Create/Edit ditekan. `excludeId` diisi di halaman edit.
  @Get('check-code')
  async checkCode(
    @Query('code') code: string,
    @Query('excludeId') excludeId: string,
    @Res() res: Response,
  ) {
    const available = await this.voucherService.isCodeAvailable(
      code ?? '',
      excludeId || undefined,
    );
    res.json({ available });
  }

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
      flashToast(
        req,
        'Voucher Created',
        'The voucher has been issued successfully.',
      );
      res.redirect('/voucher');
    } catch (error: unknown) {
      const err = error as { message?: string; detail?: string };
      console.error(
        'CREATE VOUCHER ERROR:',
        err?.message,
        err?.detail || error,
      );
      // Jaring pengaman server-side: walau cek kode di sisi klien dilewati
      // (JS mati, balapan, atau cek jaringan gagal), kode duplikat tetap
      // memunculkan notifikasi lewat flashToastError -> toast error global.
      if (this.isDuplicateCode(error)) {
        flashToastError(
          req,
          'Voucher Code Already In Use',
          'That code is already taken by another voucher. Please use a different code.',
        );
      } else {
        flashToastError(
          req,
          'Voucher Not Created',
          err?.message || 'The voucher could not be created. Please try again.',
        );
      }
      res.redirect('/voucher/formCreate');
    }
  }

  // ─── FORM EDIT ────────────────────────────────────────────────────────────

  @Get('formEdit/:id')
  async formEdit(
    @Param('id') id: string,
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
    } catch (error: unknown) {
      const err = error as Error;
      req.flash('error', err.message || 'Voucher tidak ditemukan');
      res.redirect('/voucher');
    }
  }

  // ─── PROSES UPDATE ────────────────────────────────────────────────────────

  // Browser POST ke /voucher/:id?_method=PATCH
  // Middleware method-override mengubahnya menjadi PATCH sebelum sampai sini
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVoucherDto: UpdateVoucherDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.voucherService.update(id, updateVoucherDto);
      flashToast(
        req,
        'Voucher Updated',
        'The changes to this voucher have been saved.',
      );
      res.redirect('/voucher');
    } catch (error: unknown) {
      const err = error as Error;
      // Sama seperti create: kode duplikat harus tetap memunculkan notifikasi.
      if (this.isDuplicateCode(error)) {
        flashToastError(
          req,
          'Voucher Code Already In Use',
          'That code is already taken by another voucher. Please use a different code.',
        );
      } else {
        flashToastError(
          req,
          'Voucher Not Updated',
          err.message || 'The voucher could not be updated. Please try again.',
        );
      }
      res.redirect(`/voucher/formEdit/${id}`);
    }
  }

  // ─── PROSES DELETE ────────────────────────────────────────────────────────

  // Browser POST ke /voucher/:id?_method=DELETE
  // Middleware method-override mengubahnya menjadi DELETE sebelum sampai sini
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      await this.voucherService.remove(id);
      flashToast(
        req,
        'Voucher Deleted',
        'The voucher has been removed successfully.',
      );
      res.redirect('/voucher');
    } catch (error: unknown) {
      const err = error as Error;
      req.flash('error', err.message || 'Voucher gagal dihapus');
      res.redirect('/voucher');
    }
  }
}
