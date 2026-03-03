import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, NotificationDevice } from '../auth/schemas/user.schema';
import { RegisterNotificationDto } from './dto/register-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async register(userId: string, dto: RegisterNotificationDto): Promise<{ success: boolean }> {
    const user = await this.userModel.findById(userId).select('notificationDevices').exec();
    if (!user) {
      return { success: false };
    }

    const now = new Date();
    const devices: NotificationDevice[] = Array.isArray(user.notificationDevices) ? [...user.notificationDevices] : [];

    const hasDeviceToken = !!dto.deviceToken;
    const hasSubscription = !!dto.webPushSubscription;

    if (!hasDeviceToken && !hasSubscription) {
      return { success: false };
    }

    let updated = false;

    if (hasDeviceToken) {
      const index = devices.findIndex((d) => d.deviceToken === dto.deviceToken);
      const base: NotificationDevice = {
        platform: dto.platform,
        deviceToken: dto.deviceToken,
        webPushSubscription: dto.webPushSubscription,
        updatedAt: now,
      };
      if (index >= 0) {
        devices[index] = {
          ...devices[index],
          ...base,
        };
      } else {
        devices.push({
          ...base,
          createdAt: now,
        });
      }
      updated = true;
    } else if (hasSubscription) {
      const endpoint = (dto.webPushSubscription as { endpoint?: string })?.endpoint;
      const index = endpoint
        ? devices.findIndex((d) => (d.webPushSubscription as { endpoint?: string })?.endpoint === endpoint)
        : -1;

      const base: NotificationDevice = {
        platform: dto.platform,
        webPushSubscription: dto.webPushSubscription,
        updatedAt: now,
      };

      if (index >= 0) {
        devices[index] = {
          ...devices[index],
          ...base,
        };
      } else {
        devices.push({
          ...base,
          createdAt: now,
        });
      }
      updated = true;
    }

    if (!updated) {
      return { success: false };
    }

    user.notificationDevices = devices;
    await user.save();

    return { success: true };
  }
}
