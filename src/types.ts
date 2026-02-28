export interface UserProfile {
  name: string;
  height: number;
  weight: number;
  objective: string;
  belt: string;
  belt_start_date?: string;
  stripes: number;
}

export interface Technique {
  id: number;
  name: string;
  category: string;
  type: string;
  objective?: string;
  situation?: string;
  steps: string; // JSON string in DB, parsed in frontend
  adjustments?: string;
  errors: string;
  safety?: string;
  strategy: string;
  image_ref?: string; // JSON string in DB
  status: 'mastered' | 'in_progress' | 'needs_improvement';
  favorited?: number;
  notes?: string;
}

export interface Workout {
  id: number;
  type: string;
  name: string;
  sets: number;
  reps: string;
  rest: number;
  muscle_group: string;
  completed: number;
}

export interface Achievement {
  id: number;
  name: string;
  category: string;
  unlocked: number;
  date: string;
  icon: string;
}

export interface HistoryItem {
  id: number;
  date: string;
  action: string;
  xp: number;
}

export interface ScheduleItem {
  id: number;
  day: string;
  time: string;
  activity: string;
}

export interface Diet {
  id: number;
  title: string;
  kcal: string;
  macros: string;
  color: string;
  content: string;
}
