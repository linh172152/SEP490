import { ReminderResponse, ReminderLogResponse } from "@/services/api/types";
import { parseServerDate } from "@/lib/utils";

export type ReminderDetailedStatus = 
  | 'UPCOMING'
  | 'WAITING_ROBOT'
  | 'ROBOT_NOT_RESPONDING'
  | 'WAITING_USER_RESPONSE'
  | 'MISSED_USER_NO_RESPONSE'
  | 'COMPLETED';

export function getReminderDetailedStatus(
  reminder: ReminderResponse,
  logs: ReminderLogResponse[],
  gender?: string
): { status: ReminderDetailedStatus; message?: string } {
  if (!reminder.active) {
    return { status: 'COMPLETED' };
  }

  const now = Date.now();
  const scheduledTime = parseServerDate(reminder.scheduleTime).getTime();
  
  // Find a log for this specific reminder instance
  // We look for a log triggered around the scheduled time (+/- 30 minutes to be safe for late triggers)
  const relevantLog = logs.find(log => {
    if (log.reminderId !== reminder.id) return false;
    const triggeredTime = parseServerDate(log.triggeredTime).getTime();
    return Math.abs(triggeredTime - scheduledTime) < 30 * 60 * 1000;
  });

  // T < now
  if (now < scheduledTime) {
    return { status: 'UPCOMING' };
  }

  // T <= now < T + 5m
  if (now >= scheduledTime && now < scheduledTime + 5 * 60 * 1000) {
    return { status: 'WAITING_ROBOT' };
  }

  // now >= T + 5m
  if (!relevantLog) {
    if (now >= scheduledTime + 5 * 60 * 1000) {
      return { 
        status: 'ROBOT_NOT_RESPONDING', 
        message: 'Robot không nhắc nhở' 
      };
    }
    return { status: 'WAITING_ROBOT' };
  }

  // Log exists
  if (relevantLog.confirmed) {
    return { status: 'COMPLETED' };
  }

  // Not confirmed yet
  if (now < scheduledTime + 10 * 60 * 1000) {
    return { status: 'WAITING_USER_RESPONSE' };
  } else {
    return { 
      status: 'MISSED_USER_NO_RESPONSE', 
      message: 'Không có phản hồi' 
    };
  }
}
