import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutSession, UserSettings } from '@/types/workout';

const STORAGE_KEYS = {
  WORKOUT_SESSIONS: 'workout_sessions',
  USER_SETTINGS: 'user_settings',
  WORKOUT_PLAN: 'workout_plan',
} as const;

// AsyncStorage-compatible storage functions
const getStorageItem = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error('Error getting storage item:', error);
    return null;
  }
};

const setStorageItem = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error('Error setting storage item:', error);
  }
};

export const saveWorkoutSession = async (session: WorkoutSession): Promise<void> => {
  try {
    const existingSessions = await getWorkoutSessions();
    const updatedSessions = existingSessions.filter(s => s.id !== session.id);
    updatedSessions.push(session);
    
    // Sort by date, most recent first
    updatedSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    await setStorageItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify(updatedSessions));
  } catch (error) {
    console.error('Error saving workout session:', error);
  }
};

export const getWorkoutSessions = async (): Promise<WorkoutSession[]> => {
  try {
    const sessions = await getStorageItem(STORAGE_KEYS.WORKOUT_SESSIONS);
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error('Error getting workout sessions:', error);
    return [];
  }
};

export const getUserSettings = async (): Promise<UserSettings> => {
  try {
    const settings = await getStorageItem(STORAGE_KEYS.USER_SETTINGS);
    return settings ? JSON.parse(settings) : {
      bodyWeight: 150,
      weekStartsWithDay1: true,
    };
  } catch (error) {
    console.error('Error getting user settings:', error);
    return {
      bodyWeight: 150,
      weekStartsWithDay1: true,
    };
  }
};

export const saveUserSettings = async (settings: UserSettings): Promise<void> => {
  try {
    await setStorageItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving user settings:', error);
  }
};

export const getLastWorkoutForExercise = async (exerciseId: string): Promise<{ weight: number; reps: number } | null> => {
  try {
    const sessions = await getWorkoutSessions();
    
    for (const session of sessions) {
      const exerciseData = session.exercises.find(e => e.exerciseId === exerciseId);
      if (exerciseData && exerciseData.completedSets.length > 0) {
        const lastSet = exerciseData.completedSets[exerciseData.completedSets.length - 1];
        return { weight: lastSet.weight, reps: lastSet.reps };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting last workout for exercise:', error);
    return null;
  }
};

export const exportWorkoutData = async (): Promise<string> => {
  try {
    const sessions = await getWorkoutSessions();
    const settings = await getUserSettings();
    
    const exportData = {
      sessions,
      settings,
      exportDate: new Date().toISOString(),
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting workout data:', error);
    return '';
  }
};