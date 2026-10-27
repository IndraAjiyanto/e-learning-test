import { Module } from '@nestjs/common';
import { BulkDeleteController } from './bulk-delete.controller';
import { BulkDeleteService } from './bulk-delete.service';

@Module({
  controllers: [BulkDeleteController],
  providers: [BulkDeleteService],
  exports: [BulkDeleteService],
})
export class BulkDeleteModule {}
