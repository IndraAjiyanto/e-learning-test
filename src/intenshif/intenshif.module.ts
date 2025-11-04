import { Module } from '@nestjs/common';
import { IntenshifService } from './intenshif.service';
import { IntenshifController } from './intenshif.controller';

@Module({
  controllers: [IntenshifController],
  providers: [IntenshifService],
})
export class IntenshifModule {}
