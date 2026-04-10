import { ExerciseScript } from "@/services/api/types";
import { addMonths, formatISO } from "date-fns";

export type PackageLevel = 'BASIC' | 'STANDARD' | 'PREMIUM';

export interface PackageQuota {
  easy: number;
  medium: number;
  durationMonths: number;
}

export const PACKAGE_CONFIG: Record<PackageLevel, PackageQuota> = {
  'BASIC': {
    easy: 2,
    medium: 0,
    durationMonths: 1
  },
  'STANDARD': {
    easy: 2,
    medium: 1,
    durationMonths: 1
  },
  'PREMIUM': {
    easy: 2,
    medium: 2,
    durationMonths: 2
  }
};

/**
 * Calculates the expiration date based on the package level.
 */
export const calculateExpiryDate = (level: string, fromDate: Date = new Date()): string => {
  const normalizedLevel = level.toUpperCase() as PackageLevel;
  const config = PACKAGE_CONFIG[normalizedLevel] || PACKAGE_CONFIG['BASIC'];
  const expiryDate = addMonths(fromDate, config.durationMonths);
  return formatISO(expiryDate);
};

/**
 * Filters a list of scripts based on the package quota rules.
 */
export const filterScriptsByQuota = (scripts: ExerciseScript[], level: string): ExerciseScript[] => {
  const normalizedLevel = level.toUpperCase() as PackageLevel;
  const config = PACKAGE_CONFIG[normalizedLevel] || PACKAGE_CONFIG['BASIC'];
  
  // Normalize difficulty strings for comparison
  const getNormDiff = (diff: string) => diff.toLowerCase();
  
  const easyScripts = scripts.filter(s => 
    ['easy', '1', 'l1', 'cơ bản'].includes(getNormDiff(s.difficultyLevel))
  ).slice(0, config.easy);

  const mediumScripts = scripts.filter(s => 
    ['medium', '2', 'l2', 'nâng cao'].includes(getNormDiff(s.difficultyLevel))
  ).slice(0, config.medium);

  return [...easyScripts, ...mediumScripts];
};

/**
 * Gets a human readable description of the quota.
 */
export const getQuotaDescription = (level: string): string => {
  const normalizedLevel = level.toUpperCase() as PackageLevel;
  const config = PACKAGE_CONFIG[normalizedLevel];
  if (!config) return "";

  const parts = [];
  if (config.easy > 0) parts.push(`${config.easy} bài Cơ bản`);
  if (config.medium > 0) parts.push(`${config.medium} bài Nâng cao`);
  
  return `Định mức: ${parts.join(" + ")}`;
};
