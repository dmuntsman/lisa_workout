import { WorkoutSession, UserSettings } from '@/types/workout';

export const getNextWorkoutDay = (lastWorkoutDate?: string, lastWorkoutType?: 'Day1' | 'Day2', weekStartsWithDay1: boolean = true): 'Day1' | 'Day2' => {
  if (!lastWorkoutDate || !lastWorkoutType) {
    return weekStartsWithDay1 ? 'Day1' : 'Day2';
  }
  
  const today = new Date();
  const lastDate = new Date(lastWorkoutDate);
  const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // If it's been more than 3 days, suggest starting a new week
  if (daysDiff > 3) {
    return weekStartsWithDay1 ? 'Day1' : 'Day2';
  }
  
  // Alternate between Day1 and Day2
  return lastWorkoutType === 'Day1' ? 'Day2' : 'Day1';
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const generateWorkoutId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const calculateWorkoutProgress = (session: WorkoutSession): number => {
  const totalSets = session.exercises.reduce((total, exercise) => {
    const exerciseData = session.exercises.find(e => e.exerciseId === exercise.exerciseId);
    return total + (exerciseData?.completedSets.length || 0);
  }, 0);
  
  const completedSets = session.exercises.reduce((total, exercise) => {
    const exerciseData = session.exercises.find(e => e.exerciseId === exercise.exerciseId);
    return total + (exerciseData?.completedSets.filter(set => set.completed).length || 0);
  }, 0);
  
  return totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
};

export const getWeeklyWorkoutCount = (sessions: WorkoutSession[]): number => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return sessions.filter(session => 
    new Date(session.date) >= oneWeekAgo
  ).length;
};