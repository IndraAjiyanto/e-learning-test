import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Yang dikirim peserta saat mengerjakan final assignment.
 *
 * Isinya HANYA tautan berkasnya. Pemilik baris ditetapkan server dari sesi
 * login, tidak pernah dari body request - kalau tidak, peserta bisa menulis
 * kiriman atas nama orang lain hanya dengan mengubah body.
 */
export class SubmitFinalAssignmentDto {
  @IsNotEmpty()
  @IsString()
  filePath: string;
}
