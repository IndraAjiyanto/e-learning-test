import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AbsensModule } from './absens/absens.module';
import { MaterisModule } from './materis/materis.module';
import { KelassModule } from './kelass/kelass.module';
import { PertemuansModule } from './pertemuans/pertemuans.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { User } from './entities/user.entity';
// import { Absen } from './entities/absen.entity';
// import { Kelas } from './entities/kelas.entity';
// import { Materi } from './entities/materi.entity';
// import { Pertemuan } from './entities/pertemuan.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from './data-source';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      // load: [jwtConfig], 
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    UsersModule, AbsensModule, MaterisModule, KelassModule, PertemuansModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
