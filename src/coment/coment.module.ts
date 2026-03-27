import { Module } from '@nestjs/common';
import { ComentService } from './coment.service';
import { ComentController } from './coment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coment } from 'src/entities/coment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Coment])],
  controllers: [ComentController],
  providers: [ComentService],
})
export class ComentModule {}
