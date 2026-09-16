import { IsObject } from 'class-validator';

export class CreateVisionsDto {
  // Dikirim form sebagai visions[id] / visions[en] / visions[ja].
  @IsObject()
  visions: { id: string; en: string; ja: string };
}
