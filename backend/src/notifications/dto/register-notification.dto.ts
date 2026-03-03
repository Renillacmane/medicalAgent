import { IsIn, IsNotEmpty, IsObject, IsOptional, IsString, ValidateIf } from 'class-validator';

export type NotificationPlatform = 'ios' | 'android' | 'web';

export class RegisterNotificationDto {
  @IsString()
  @IsIn(['ios', 'android', 'web'])
  platform: NotificationPlatform;

  @IsOptional()
  @IsString()
  @ValidateIf((o: RegisterNotificationDto) => !o.webPushSubscription)
  @IsNotEmpty()
  deviceToken?: string;

  @IsOptional()
  @IsObject()
  @ValidateIf((o: RegisterNotificationDto) => !o.deviceToken)
  webPushSubscription?: Record<string, unknown>;
}
