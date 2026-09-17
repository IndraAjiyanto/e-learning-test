import { Module } from '@nestjs/common';
import { InformationController } from './information.controller';
import { UserActivityModule } from 'src/user_activity/user-activity.module';

@Module({
  imports: [UserActivityModule],
  controllers: [InformationController],
})
export class InformationModule {}
