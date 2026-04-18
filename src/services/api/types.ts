// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  gender: string;
  email: string;
  phone: string;
  password: string;
  role: "ELDERLYUSER" | "CAREGIVER" | "FAMILYMEMBER" | "MANAGER" | "ADMINISTRATOR" | string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
  gender: string;
  roomId?: number;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

// Voice Profile Types
export interface VoiceProfileRequest {
  elderlyId: number;
  voicePrintHash: string;
  sampleCount: number;
}

export interface VoiceProfileResponse extends VoiceProfileRequest {
  id: number;
  createdAt: string;
  updatedAt: string;
}

// Voice Command Types
export interface VoiceCommandRequest {
  interactionId: number;
  commandText: string;
  commandType: string;
}

export interface VoiceCommandResponse extends VoiceCommandRequest {
  id: number;
  createdAt: string;
}

// User Package Types
export interface UserPackageRequest {
  accountId: number;
  servicePackageId: number;
  elderlyProfileId?: number;
  assignedAt: string;
  expiredAt?: string | null;
  status: "PENDING" | "PAID" | string;
}

export interface UserPackageResponse extends UserPackageRequest {
  id: number;
}

export interface RoomElderlySummary {
  id: number;
  name: string;
  accountId?: number;
}

// System Log Types
export interface SystemLogRequest {
  accountId: number;
  action: string;
  targetEntity: string;
}

export interface SystemLogResponse extends SystemLogRequest {
  id: number;
  createdAt: string;
}

// Service Package Types
export interface ServicePackageRequest {
  name: string;
  description: string;
  level: string;
  price: number;
  active: boolean;
  durationDays?: number;
  exerciseIds?: number[];
}

export interface ServicePackageResponse extends ServicePackageRequest {
  id: number;
}

export interface PaymentCreateResponse {
  qrCodeUrl: string;
  amount: number;
  description: string;
}

export interface PaymentConfirmRequest {
  description: string;
  amount: number;
}

export type PaymentConfirmResponse =
  | string
  | {
      message?: string;
      status?: string;
    };

// Robot Types
export interface RobotRequest {
  robotName: string;
  model: string;
  serialNumber: string;
  firmwareVersion: string;
  status: string;
  assignedElderlyId?: number;
}

export interface RobotResponse {
  id: number;
  robotName: string;
  model: string;
  serialNumber: string;
  firmwareVersion: string;
  status: string;
  assignedElderlyId?: number;
  assignedElderlyName?: string;
  roomId?: number;
  roomName?: string;
}

// Reminder Types
export interface ReminderRequest {
  elderlyId: number;
  caregiverId: number;
  title: string;
  reminderType: string;
  scheduleTime: string;
  repeatPattern: string;
  active: boolean;
}

export interface ReminderResponse extends ReminderRequest {
  id: number;
  accountId?: number | null;
  elderlyName?: string | null;
  caregiverName?: string | null;
}

// Reminder Log Types
export interface ReminderLogRequest {
  reminderId: number;
  robotId: number;
  elderlyId: number;
  triggeredTime: string;
}

export interface ReminderLogResponse extends ReminderLogRequest {
  id: number;
  reminderTitle: string;
  robotName: string;
  elderlyName: string;
  confirmed: boolean;
  confirmedTime?: string;
}

// Exercise Script Types
export interface ExerciseScriptRequest {
  name: string;
  description: string;
  durationMinutes: number;
  level?: string;
  uploadScript: string;
}

export interface ExerciseScriptResponse extends ExerciseScriptRequest {
  id: number;
  deleted?: boolean;
  level?: string;
}

export type ExerciseScript = ExerciseScriptResponse;

// Elderly Profile Types
export interface ElderlyProfileRequest {
  name: string;
  dateOfBirth: string;
  healthNotes: string;
  preferredLanguage: string;
  speakingSpeed: string;
  roomId?: number | null;
}

export interface ElderlyProfileResponse extends ElderlyProfileRequest {
  id: number;
  accountId: number;
  roomId?: number | null;
  fullName?: string;
  deleted: boolean;
  name: string;
}

// Caregiver Profile Types
export interface CaregiverProfileRequest {
  accountId: number;
  name: string;
  relationship: string;
  notificationPreference: string;
}

export interface CaregiverProfileResponse extends CaregiverProfileRequest {
  id: number;
  accountEmail: string;
  name: string;
  roomId?: number | null;
}

// Account Response from BE
export interface AccountResponse {
  id: number;
  fullName: string;     // standard camelCase
  FullName?: string;    // fallback for PascalCase from some BE versions
  gender: string;
  Gender?: string;
  email: string;
  phone: string;
  token: string;
  status: string;
  deleted?: boolean;    // optional status flag
  message?: string;
  verified?: string;
  createdAt: string;
  role?: string;
  roomId?: number;
}

export interface ChangePasswordRequest {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// Alert Notification Types
export interface AlertNotificationRequest {
  elderlyId: number;
  alertType: string;
  message: string;
  resolved: boolean;
  reminderId?: number | null;
}

export interface AlertNotificationResponse extends AlertNotificationRequest {
  id: number;
  elderlyName: string;
  createdAt: string;
}

// Interaction Log Types
export interface InteractionLogRequest {
  elderlyId: number;
  robotId: number;
  interactionType: string;
  userInputText: string;
  robotResponseText: string;
  emotionDetected?: string;
}

export interface InteractionLogResponse extends InteractionLogRequest {
  id: number;
  elderlyName: string;
  robotName: string;
  createdAt: string;
}

// Room Types
export interface RoomRequest {
  roomId?: number;
  roomName: string;
  managerId: number;
}

export interface CaregiverDTO {
  id: number;
  name: string;
  email: string;
}

export interface ElderlyDTO {
  id: number;
  name: string;
  accountId: number;
  dateOfBirth?: string;
}

export interface RobotDTO {
  id: number;
  robotName: string;
  model: string;
  serialNumber: string;
  status: string;
}

export interface RoomResponse {
  id: number;
  roomName: string;
  managerId: number;
  managerName?: string;
  caregivers: CaregiverDTO[];
  elderlies: ElderlyDTO[];
  robot: RobotDTO | null;
}
