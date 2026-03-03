import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [AuthModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
