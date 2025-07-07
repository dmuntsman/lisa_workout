import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Check, Plus, Minus } from 'lucide-react-native';
import { Exercise, CompletedSet } from '@/types/workout';

interface ExerciseCardProps {
  exercise: Exercise;
  completedSets: CompletedSet[];
  lastWorkoutData?: { weight: number; reps: number };
  onSetComplete: (setIndex: number, weight: number, reps: number) => void;
  onSetRemove: (setIndex: number) => void;
}

export default function ExerciseCard({
  exercise,
  completedSets,
  lastWorkoutData,
  onSetComplete,
  onSetRemove,
}: ExerciseCardProps) {
  const [currentWeight, setCurrentWeight] = useState(
    lastWorkoutData?.weight?.toString() || '0'
  );
  const [currentReps, setCurrentReps] = useState(
    exercise.targetReps.toString()
  );

  const handleSetComplete = () => {
    const weight = parseFloat(currentWeight) || 0;
    const reps = parseInt(currentReps) || 0;
    
    if (weight < 0 || reps < 0) {
      Alert.alert('Invalid Input', 'Please enter valid positive numbers.');
      return;
    }
    
    onSetComplete(completedSets.length, weight, reps);
  };

  const handleSetRemove = (setIndex: number) => {
    onSetRemove(setIndex);
  };

  const completedCount = completedSets.filter(set => set.completed).length;
  const isCompleted = completedCount >= exercise.targetSets;

  return (
    <View style={[styles.card, isCompleted && styles.completedCard]}>
      <View style={styles.header}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        {exercise.isSuperset && (
          <View style={styles.supersetBadge}>
            <Text style={styles.supersetText}>SUPERSET</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.targetText}>
        Target: {exercise.targetSets} sets × {exercise.targetReps} reps
      </Text>
      
      {exercise.notes && (
        <Text style={styles.notesText}>{exercise.notes}</Text>
      )}
      
      {lastWorkoutData && (
        <Text style={styles.lastWorkoutText}>
          Last: {lastWorkoutData.weight}lbs × {lastWorkoutData.reps} reps
        </Text>
      )}

      <View style={styles.setsContainer}>
        {completedSets.map((set, index) => (
          <View key={index} style={styles.completedSet}>
            <View style={styles.setInfo}>
              <Text style={styles.setNumber}>Set {index + 1}</Text>
              <Text style={styles.setDetails}>
                {set.weight}lbs × {set.reps} reps
              </Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleSetRemove(index)}
            >
              <Minus size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {!isCompleted && (
        <View style={styles.inputContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Weight (lbs)</Text>
            <TextInput
              style={styles.input}
              value={currentWeight}
              onChangeText={setCurrentWeight}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reps</Text>
            <TextInput
              style={styles.input}
              value={currentReps}
              onChangeText={setCurrentReps}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
          
          <TouchableOpacity
            style={styles.addSetButton}
            onPress={handleSetComplete}
          >
            <Plus size={20} color="#ffffff" />
            <Text style={styles.addSetText}>Add Set</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${(completedCount / exercise.targetSets) * 100}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {completedCount}/{exercise.targetSets} sets
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  supersetBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  supersetText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  targetText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  lastWorkoutText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 12,
  },
  setsContainer: {
    marginVertical: 8,
  },
  completedSet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  setInfo: {
    flex: 1,
  },
  setNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  setDetails: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  removeButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#fee2e2',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 12,
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'monospace',
    textAlign: 'center',
    backgroundColor: '#ffffff',
  },
  addSetButton: {
    backgroundColor: '#22c55e',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 4,
  },
  addSetText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
});