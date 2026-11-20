import { VoucherType } from 'src/entities/voucher.entity';

export class UpdateVoucherDto {
  code_voucher?: string;
  type?: VoucherType;
  percent?: string | number | null;
  active?: string | boolean;
  courseIds?: string[] | string;
  allowed_user_ids?: string[] | string;
}
