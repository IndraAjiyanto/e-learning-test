import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImgUrlToTeknologi1782982222007 implements MigrationInterface {
  name = 'AddImgUrlToTeknologi1782982222007';

  public up(queryRunner: QueryRunner): Promise<void> {
    void queryRunner;
    return Promise.resolve();
  }

  public down(queryRunner: QueryRunner): Promise<void> {
    void queryRunner;
    return Promise.resolve();
  }
}
