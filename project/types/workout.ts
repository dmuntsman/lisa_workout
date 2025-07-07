export interface Exercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps: number;
  isSuperset?: boolean;
  supersetWith?: string[];
  notes?: string;
}

export interface CompletedSet {
  weight: number;
  reps: number;
  completed: boolean;
  timestamp: number;
}

export interface WorkoutSession {
  id: string;
  date: string;
  dayType: 'Day1' | 'Day2';
  exercises: {
    exerciseId: string;
    completedSets: CompletedSet[];
  }[];
  bodyWeight?: number;
  duration?: number;
  notes?: string;
  completed: boolean;
}

export interface WorkoutPlan {
  Day1: Exercise[];
  Day2: Exercise[];
}

export interface UserSettings {
  bodyWeight: number;
  lastWorkoutDate?: string;
  lastWorkoutType?: 'Day1' | 'Day2';
  weekStartsWithDay1: boolean;
}