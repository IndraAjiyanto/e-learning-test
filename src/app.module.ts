import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AbsensModule } from './absens/absens.module';
import { MaterisModule } from './materis/materis.module';
import { KelassModule } from './kelass/kelass.module';
import { PertemuansModule } from './pertemuans/pertemuans.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Absen } from './entities/absen.entity';
import { Kelas } from './entities/kelas.entity';
import { Materi } from './entities/materi.entity';
import { Pertemuan } from './entities/pertemuan.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      // load: [jwtConfig], 
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
      type: 'postgres',
      host: configService.get('DB_HOST'),
      port: +configService.get('DB_PORT'),
      username: configService.get('DB_USERNAME'),
      password: configService.get('DB_PASSWORD'), 
      database: configService.get('DB_NAME'), 
      entities: [User, Absen, Kelas, Materi, Pertemuan], 
      synchronize: true, 
      }),
    }),
    UsersModule, AbsensModule, MaterisModule, KelassModule, PertemuansModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
