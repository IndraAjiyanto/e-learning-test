import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { AppModule } from 'src/app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const userRepository = dataSource.getRepository(User);

  // isVerified wajib true: AuthController memblokir login user yang belum terverifikasi
  // dan mengalihkannya ke /users/send-verify-email.
  const hashedPassword = await bcrypt.hash('12345678', 10);

  const users = await userRepository.save([
    {
      username: 'super admin',
      email: 'super@gmail.com',
      password: hashedPassword,
      role: 'super_admin',
      isVerified: true,
    },
    {
      username: 'mentor',
      email: 'mentor@gmail.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
    },
    {
      username: 'indra',
      email: 'indra@gmail.com',
      password: hashedPassword,
      role: 'user',
      isVerified: true,
    },
  ]);

  console.log(
    'Users seeded successfully:',
    users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
    })),
  );

  await app.close();
}
bootstrap();
