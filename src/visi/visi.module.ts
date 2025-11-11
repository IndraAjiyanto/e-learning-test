import { Module } from '@nestjs/common';
import { VisiService } from './visi.service';
import { VisiController } from './visi.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Visi } from 'src/entities/visi.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Visi])],
  controllers: [VisiController],
  providers: [VisiService],
  exports: [VisiService],
})
export class VisiModule {}
