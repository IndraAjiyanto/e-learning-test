import { IsString } from 'class-validator';

export class CreateCategoryPartnerDto {
  @IsString()
  category: string;
}
