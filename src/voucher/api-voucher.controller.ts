import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { Request, Response } from 'express';
import { AuthenticatedGuard } from 'src/common/guards/authentication.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@UseGuards(AuthenticatedGuard)
@Roles('user')
@Controller('api/voucher')
export class ApiVoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post('validate')
  async validate(
    @Body() body: { code: string; courseId: number; subtotal: number },
    @Res() res: Response,
    @Req() req: Request & { user?: any }
  ) {
    try {
      const { code, courseId, subtotal } = body;
      const userId = req.user?.id;
      
      if (!code || !courseId || !subtotal) {
        return res.status(400).json({ status: 'error', message: 'Data tidak lengkap' });
      }

      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Silakan login terlebih dahulu' });
      }

      const result = await this.voucherService.validateVoucher(code.trim().toUpperCase(), Number(courseId), Number(subtotal), userId);

      return res.json({
        status: 'success',
        data: {
          subtotal: Number(subtotal),
          discount_amount: result.discountAmount,
          final_total: result.finalTotal,
          promo_code: code.trim().toUpperCase()
        },
        message: 'Kode promo berhasil diterapkan!'
      });
    } catch (error: any) {
      return res.status(400).json({ 
        status: 'error', 
        message: error.message || 'Voucher tidak valid.' 
      });
    }
  }
}
