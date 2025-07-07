import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, X, Save } from 'lucide-react-native';
import { defaultWorkoutPlan } from '@/data/workoutPlan';
import { WorkoutSession, CompletedSet } from '@/types/workout';
import { saveWorkoutSession, getUserSettings, saveUserSettings, getLastWorkoutForExercise } from '@/utils/storage';
import { generateWorkoutId } from '@/utils/workoutHelper';
import ExerciseCard from '@/components/ExerciseCard';
import WorkoutHeader from '@/components/WorkoutHeader';

export default function WorkoutScreen() {
  const { dayType } = useLocalSearchParams<{ dayType: 'Day1' | 'Day2' }>();
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [duration, setDuration] = useState(0);
  const [exerciseHistory, setExerciseHistory] = useState<Record<string, { weight: number; reps: number }>>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!dayType) {
      router.replace('/');
      return;
    }

    initializeWorkout();
    startTimer();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dayType]);

  const initializeWorkout = async () => {
    try {
      const exercises = defaultWorkoutPlan[dayType];
      
      // Load previous workout data for each exercise
      const history: Record<string, { weight: number; reps: number }> = {};
      for (const exercise of exercises) {
        const lastWorkout = await getLastWorkoutForExercise(exercise.id);
        if (lastWorkout) {
          history[exercise.id] = lastWorkout;
        }
      }
      setExerciseHistory(history);

      const session: WorkoutSession = {
        id: generateWorkoutId(),
        date: new Date().toISOString(),
        dayType,
        exercises: exercises.map(exercise => ({
          exerciseId: exercise.id,
          completedSets: [],
        })),
        completed: false,
      };

      setCurrentSession(session);
      setStartTime(Date.now());
    } catch (error) {
      console.error('Error initializing workout:', error);
      Alert.alert('Error', 'Failed to start workout. Please try again.');
    }
  };

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
  };

  const handleSetComplete = (exerciseId: string, setIndex: number, weight: number, reps: number) => {
    if (!currentSession) return;

    const newSet: CompletedSet = {
      weight,
      reps,
      completed: true,
      timestamp: Date.now(),
    };

    setCurrentSession(prev => {
      if (!prev) return null;

      const updatedExercises = prev.exercises.map(exercise => {
        if (exercise.exerciseId === exerciseId) {
          const newCompletedSets = [...exercise.completedSets];
          newCompletedSets[setIndex] = newSet;
          return {
            ...exercise,
            completedSets: newCompletedSets,
          };
        }
        return exercise;
      });

      return {
        ...prev,
        exercises: updatedExercises,
      };
    });

    // Auto-save progress
    saveProgress();
  };

  const handleSetRemove = (exerciseId: string, setIndex: number) => {
    if (!currentSession) return;

    setCurrentSession(prev => {
      if (!prev) return null;

      const updatedExercises = prev.exercises.map(exercise => {
        if (exercise.exerciseId === exerciseId) {
          const newCompletedSets = [...exercise.completedSets];
          newCompletedSets.splice(setIndex, 1);
          return {
            ...exercise,
            completedSets: newCompletedSets,
          };
        }
        return exercise;
      });

      return {
        ...prev,
        exercises: updatedExercises,
      };
    });

    // Auto-save progress
    saveProgress();
  };

  const saveProgress = async () => {
    if (!currentSession) return;

    try {
      const sessionToSave = {
        ...currentSession,
        duration: Math.floor((Date.now() - startTime) / 1000 / 60), // Convert to minutes
      };
      
      await saveWorkoutSession(sessionToSave);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const finishWorkout = async () => {
    if (!currentSession) return;

    try {
      const finalSession = {
        ...currentSession,
        completed: true,
        duration: Math.floor((Date.now() - startTime) / 1000 / 60), // Convert to minutes
      };

      await saveWorkoutSession(finalSession);

      // Update user settings with last workout info
      const settings = await getUserSettings();
      await saveUserSettings({
        ...settings,
        lastWorkoutDate: finalSession.date,
        lastWorkoutType: finalSession.dayType,
      });

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      Alert.alert(
        'Workout Complete!',
        `Great job! You completed your ${dayType} workout in ${Math.floor(duration / 60)} minutes.`,
        [
          {
            text: 'View Progress',
            onPress: () => router.replace('/progress'),
          },
          {
            text: 'Go Home',
            onPress: () => router.replace('/'),
          },
        ]
      );
    } catch (error) {
      console.error('Error finishing workout:', error);
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    }
  };

  const cancelWorkout = () => {
    Alert.alert(
      'Cancel Workout',
      'Are you sure you want to cancel? Your progress will be lost.',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Cancel Workout',
          style: 'destructive',
          onPress: () => {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            router.replace('/');
          },
        },
      ]
    );
  };

  if (!currentSession || !dayType) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Starting workout...</Text>
      </View>
    );
  }

  const exercises = defaultWorkoutPlan[dayType];
  const completedExercises = currentSession.exercises.filter(exercise => {
    const exerciseData = defaultWorkoutPlan[dayType].find(e => e.id === exercise.exerciseId);
    return exerciseData && exercise.completedSets.filter(s => s.completed).length >= exerciseData.targetSets;
  }).length;

  return (
    <View style={styles.container}>
      <WorkoutHeader
        dayType={dayType}
        duration={duration}
        completedExercises={completedExercises}
        totalExercises={exercises.length}
      />

      <ScrollView style={styles.content}>
        {exercises.map((exercise, index) => {
          const exerciseData = currentSession.exercises.find(e => e.exerciseId === exercise.id);
          const completedSets = exerciseData?.completedSets || [];

          return (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              completedSets={completedSets}
              lastWorkoutData={exerciseHistory[exercise.id]}
              onSetComplete={(setIndex, weight, reps) => 
                handleSetComplete(exercise.id, setIndex, weight, reps)
              }
              onSetRemove={(setIndex) => handleSetRemove(exercise.id, setIndex)}
            />
          );
        })}
      </ScrollView>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.cancelButton} onPress={cancelWorkout}>
          <X size={20} color="#ef4444" />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.saveButton} onPress={saveProgress}>
          <Save size={20} color="#3b82f6" />
          <Text style={styles.saveButtonText}>Save Progress</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.finishButton} onPress={finishWorkout}>
          <Check size={20} color="#ffffff" />
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    gap: 4,
  },
  cancelButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#dbeafe',
    gap: 4,
  },
  saveButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  finishButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    gap: 4,
  },
  finishButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});