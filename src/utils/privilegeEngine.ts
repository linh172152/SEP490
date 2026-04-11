import { ExerciseScript } from "@/services/api/types";

const quotaDescriptions: Record<string, string> = {
  ALL: "All exercise scripts are available for preview.",
  FREE: "Preview only basic exercise scripts.",
  STANDARD: "Preview standard exercises and beginner plans.",
  PREMIUM: "Preview premium exercises and advanced plans.",
};

const quotaDurationDays: Record<string, number> = {
  FREE: 30,
  STANDARD: 60,
  PREMIUM: 90,
};

export function getQuotaDescription(level: string) {
  return quotaDescriptions[level] ?? quotaDescriptions.ALL;
}

export function calculateExpiryDate(level: string, assignedAt: Date | string = new Date()) {
  const assignedDate = typeof assignedAt === "string" ? new Date(assignedAt) : assignedAt;
  const duration = quotaDurationDays[level] ?? quotaDurationDays.FREE;
  const expiry = new Date(assignedDate.getTime() + duration * 24 * 60 * 60 * 1000);
  return expiry.toISOString();
}

export function filterScriptsByQuota(scripts: ExerciseScript[], level: string) {
  if (level === "ALL") {
    return scripts;
  }

  return scripts.filter((script) => {
    if (level === "FREE") {
      return script.difficultyLevel === "Beginner" || script.difficultyLevel === "Easy";
    }
    if (level === "STANDARD") {
      return script.difficultyLevel !== "Expert";
    }
    return true;
  });
}
