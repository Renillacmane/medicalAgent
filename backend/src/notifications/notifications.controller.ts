import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/schemas/user.schema';
import { NotificationsService } from './notifications.service';
import { RegisterNotificationDto } from './dto/register-notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('register')
  async register(@CurrentUser() user: User, @Body() dto: RegisterNotificationDto): Promise<{ success: boolean }> {
    const doc = user as User & { id?: string; _id?: { toString(): string } };
    const userId = doc.id ?? doc._id?.toString?.() ?? '';
    return this.notificationsService.register(userId, dto);
  }
}
