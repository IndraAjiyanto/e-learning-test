import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VoucherType } from 'src/entities/voucher.entity';

export class CreateVoucherDto {
  @ApiProperty({ example: 'VOUCHER123' })
  @IsString()
  code_voucher: string;

  @ApiProperty({ enum: ['free', 'discount'], example: 'discount' })
  @IsEnum(['free', 'discount'])
  type: VoucherType;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
