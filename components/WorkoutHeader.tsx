import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Timer, Calendar, Target } from 'lucide-react-native';

interface WorkoutHeaderProps {
  dayType: 'Day1' | 'Day2';
  duration: number;
  completedExercises: number;
  totalExercises: number;
}

export default function WorkoutHeader({
  dayType,
  duration,
  completedExercises,
  totalExercises,
}: WorkoutHeaderProps) {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          {dayType === 'Day1' ? 'Chest, Triceps, Quads/Glutes' : 'Back, Shoulders, Biceps, Abs'}
        </Text>
        <View style={styles.dayBadge}>
          <Text style={styles.dayText}>{dayType}</Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Timer size={16} color="#3b82f6" />
          <Text style={styles.statText}>{formatDuration(duration)}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Calendar size={16} color="#3b82f6" />
          <Text style={styles.statText}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Target size={16} color="#3b82f6" />
          <Text style={styles.statText}>
            {completedExercises}/{totalExercises} exercises
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  dayBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dayText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
});