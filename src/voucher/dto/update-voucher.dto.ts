import { VoucherType } from 'src/entities/voucher.entity';

export class UpdateVoucherDto {
  code_voucher?: string;
  type?: VoucherType;
  percent?: any;
  active?: any;
  courseIds?: any;
}
