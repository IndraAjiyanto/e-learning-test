import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { AppModule } from 'src/app.module';
import { Kategori } from 'src/entities/kategori.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const userRepository = dataSource.getRepository(User);
  const kategoriRepository = dataSource.getRepository(Kategori);

  const hashedPassword = await bcrypt.hash('12345678', 10);

  await userRepository.save([
    {
      username: 'super admin',
      email: 'super@gmail.com',
      profile: 'logo_wiratek.png',
      password: hashedPassword,
      role: 'super_admin',
    },
    {
      username: 'mentor',
      email: 'mentor@gmail.com',
      profile: 'logo_wiratek.png',
      password: hashedPassword,
      role: 'admin',
    },
    {
      username: 'indra',
      email: 'indra@gmail.com',
      profile: 'logo_wiratek.png',
      password: hashedPassword,
      role: 'user',
    }
  ]);

    await kategoriRepository.save([
    {
      nama_kategori: 'free class'
    },
    {
      nama_kategori: 'course'
    },
    {
      nama_kategori: 'bootcamp'
    }
  ]);

  await app.close();
}
bootstrap();
