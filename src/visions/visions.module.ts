import { Module } from '@nestjs/common';
import { VisionsService } from './visions.service';
import { VisionsController } from './visions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vision } from 'src/entities/visions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vision])],
  controllers: [VisionsController],
  providers: [VisionsService],
  exports: [VisionsService],
})
export class VisionsModule {}
