import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kelas } from 'src/entities/kelas.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Kelas])],
  controllers: [DashboardController],
  providers: [DashboardService],
    exports: [DashboardService]
  
})
export class DashboardModule {}
