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
  assignedAt: string;
  expiredAt: string;
}

export interface UserPackageResponse extends UserPackageRequest {
  id: number;
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
}

export interface ServicePackageResponse extends ServicePackageRequest {
  id: number;
}

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
}

// Robot Status Log Types
export interface RobotStatusLogRequest {
  robotId: number;
  status: string;
}

export interface RobotStatusLogResponse extends RobotStatusLogRequest {
  id: number;
  robotName: string;
  reportedAt: string;
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
  elderlyName: string;
  caregiverName: string;
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

// Exercise Session Types
export interface ExerciseSessionRequest {
  exerciseId: number;
  elderlyId: number;
  robotId: number;
  startedAt: string;
  completedAt?: string;
  feedback?: string;
}

export interface ExerciseSessionResponse extends ExerciseSessionRequest {
  id: number;
  exerciseName: string;
  elderlyName: string;
  robotName: string;
}

export type ExerciseSession = ExerciseSessionResponse;

// Exercise Script Types
export interface ExerciseScriptRequest {
  name: string;
  description: string;
  durationMinutes: number;
  difficultyLevel: string;
  uploadScript: string;
}

export interface ExerciseScriptResponse extends ExerciseScriptRequest {
  id: number;
}

export type ExerciseScript = ExerciseScriptResponse;

// Elderly Profile Types
export interface ElderlyProfileRequest {
  name: string;
  dateOfBirth: string;
  healthNotes: string;
  preferredLanguage: string;
  speakingSpeed: string;
}

export interface ElderlyProfileResponse extends ElderlyProfileRequest {
  id: number;
  accountId: number;
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
  role?: any;
  roomId?: number;
}

// Alert Notification Types
export interface AlertNotificationRequest {
  elderlyId: number;
  alertType: string;
  message: string;
  resolved: boolean;
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
  name: string;
  description?: string;
  capacity: number;
  floor?: string;
}

export interface RoomResponse extends RoomRequest {
  id: number;
  elderlyCount: number;
  caregiverId?: number;
  caregiverName?: string;
}

export type Room = RoomResponse;

