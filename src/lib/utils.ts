import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'Beginner':
    case 'Easy':
      return 'text-green-500';
    case 'Intermediate':
    case 'Medium':
      return 'text-yellow-500';
    case 'Advanced':
    case 'Hard':
      return 'text-red-500';
    default:
      return 'text-blue-500';
  }
}

export function getDifficultyBg(difficulty: string): string {
  switch (difficulty) {
    case 'Beginner':
    case 'Easy':
      return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'Intermediate':
    case 'Medium':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'Advanced':
    case 'Hard':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    default:
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  }
}

export function calculateXP(completedTopics: number, completedProjects: number): number {
  return completedTopics * 100 + completedProjects * 500;
}

export function getLevel(xp: number): { level: number; title: string; nextXP: number } {
  const levels = [
    { level: 1, title: 'Data Apprentice', xp: 0, nextXP: 500 },
    { level: 2, title: 'Cloud Explorer', xp: 500, nextXP: 1500 },
    { level: 3, title: 'Pipeline Builder', xp: 1500, nextXP: 3000 },
    { level: 4, title: 'Spark Engineer', xp: 3000, nextXP: 5000 },
    { level: 5, title: 'Azure Specialist', xp: 5000, nextXP: 8000 },
    { level: 6, title: 'Data Architect', xp: 8000, nextXP: 12000 },
    { level: 7, title: 'Senior DE', xp: 12000, nextXP: 18000 },
    { level: 8, title: 'Principal Engineer', xp: 18000, nextXP: 25000 },
    { level: 9, title: 'Data Platform Lead', xp: 25000, nextXP: 35000 },
    { level: 10, title: 'Azure Data Expert', xp: 35000, nextXP: Infinity },
  ];

  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].xp) {
      return levels[i];
    }
  }
  return levels[0];
}

export function getProgressPercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
