import { IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class NotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  dailyRecommendations?: boolean;

  @IsOptional()
  @IsBoolean()
  vitalsReminder?: boolean;

  @IsOptional()
  @IsBoolean()
  medicationReminder?: boolean;
}

export class UpdateSettingsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationSettingsDto)
  notificationSettings?: NotificationSettingsDto;
}
