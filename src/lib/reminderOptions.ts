export interface ReminderOption {
  value: string;
  label: string;
}

export const REMINDER_TYPE_OPTIONS: ReminderOption[] = [
  { value: 'medication', label: 'Medication' },
  { value: 'hydration', label: 'Hydration' },
  { value: 'meal', label: 'Meal' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'appointment', label: 'Appointment' },
  { value: 'routine', label: 'Routine' },
];

export const REMINDER_PATTERN_OPTIONS: ReminderOption[] = [
  { value: 'once', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'every_2_hours', label: 'Every 2 Hours' },
];

export const normalizeReminderType = (value: string) => {
  const normalized = value.trim().toLowerCase();

  if (normalized === 'medicine' || normalized === 'media') {
    return 'medication';
  }

  return normalized;
};

export const normalizeReminderPattern = (value: string) => {
  const normalized = value.trim().toLowerCase();

  if (normalized === 'every2hours') {
    return 'every_2_hours';
  }

  return normalized;
};

export const getReminderTypeLabel = (value: string) => {
  const normalized = normalizeReminderType(value);
  return REMINDER_TYPE_OPTIONS.find((item) => item.value === normalized)?.label || value;
};

export const getReminderPatternLabel = (value: string) => {
  const normalized = normalizeReminderPattern(value);
  return REMINDER_PATTERN_OPTIONS.find((item) => item.value === normalized)?.label || value;
};
