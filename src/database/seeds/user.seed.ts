import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { AppModule } from 'src/app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const userRepository = dataSource.getRepository(User);

  const hashedPassword = await bcrypt.hash('12345678', 10);

  await userRepository.save([
    {
      username: 'super admin',
      email: 'super@gmail.com',
      password: hashedPassword,
      role: 'super_admin'
    }
  ]);

  await app.close();
}
bootstrap();
