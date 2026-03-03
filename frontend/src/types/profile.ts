export type DietaryPreference = { type?: string; restrictions?: string[] };

export type Objectives = { body?: string[]; health?: string[]; mind?: string[] };

export type NotificationSettings = {
  dailyRecommendations?: boolean;
  vitalsReminder?: boolean;
  medicationReminder?: boolean;
};

export type PatientProfile = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  isActive?: boolean;
  height?: number;
  weight?: number;
  dietaryPreference?: DietaryPreference;
  objectives?: Objectives;
  notificationSettings?: NotificationSettings;
  createdAt?: string;
  updatedAt?: string;
};
