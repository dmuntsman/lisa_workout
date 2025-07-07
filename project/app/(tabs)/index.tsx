import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Play, Calendar, TrendingUp, User } from 'lucide-react-native';
import { getUserSettings, getWorkoutSessions } from '@/utils/storage';
import { getNextWorkoutDay, getWeeklyWorkoutCount, formatDate } from '@/utils/workoutHelper';
import { UserSettings, WorkoutSession } from '@/types/workout';

export default function HomeScreen() {
  const [settings, setSettings] = useState<UserSettings>({
    bodyWeight: 150,
    weekStartsWithDay1: true,
  });
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [nextWorkoutDay, setNextWorkoutDay] = useState<'Day1' | 'Day2'>('Day1');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userSettings = await getUserSettings();
      const sessions = await getWorkoutSessions();
      
      setSettings(userSettings);
      setRecentSessions(sessions.slice(0, 3));
      setWeeklyCount(getWeeklyWorkoutCount(sessions));
      
      const nextDay = getNextWorkoutDay(
        userSettings.lastWorkoutDate,
        userSettings.lastWorkoutType,
        userSettings.weekStartsWithDay1
      );
      setNextWorkoutDay(nextDay);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const startWorkout = (dayType: 'Day1' | 'Day2') => {
    router.push({
      pathname: '/workout',
      params: { dayType }
    });
  };

  const getDayTitle = (dayType: 'Day1' | 'Day2') => {
    return dayType === 'Day1' 
      ? 'Chest, Triceps, Quads/Glutes'
      : 'Back, Shoulders, Biceps, Abs';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FitTracker</Text>
        <Text style={styles.subtitle}>Your minimalist workout companion</Text>
      </View>

      <View style={styles.quickStart}>
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <View style={styles.workoutButtons}>
          <TouchableOpacity
            style={[
              styles.workoutButton,
              nextWorkoutDay === 'Day1' && styles.suggestedWorkout
            ]}
            onPress={() => startWorkout('Day1')}
          >
            <View style={styles.workoutButtonContent}>
              <Play size={24} color="#ffffff" />
              <View style={styles.workoutButtonText}>
                <Text style={styles.workoutButtonTitle}>Day 1</Text>
                <Text style={styles.workoutButtonSubtitle}>
                  {getDayTitle('Day1')}
                </Text>
              </View>
            </View>
            {nextWorkoutDay === 'Day1' && (
              <View style={styles.suggestedBadge}>
                <Text style={styles.suggestedText}>SUGGESTED</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.workoutButton,
              nextWorkoutDay === 'Day2' && styles.suggestedWorkout
            ]}
            onPress={() => startWorkout('Day2')}
          >
            <View style={styles.workoutButtonContent}>
              <Play size={24} color="#ffffff" />
              <View style={styles.workoutButtonText}>
                <Text style={styles.workoutButtonTitle}>Day 2</Text>
                <Text style={styles.workoutButtonSubtitle}>
                  {getDayTitle('Day2')}
                </Text>
              </View>
            </View>
            {nextWorkoutDay === 'Day2' && (
              <View style={styles.suggestedBadge}>
                <Text style={styles.suggestedText}>SUGGESTED</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.stats}>
        <Text style={styles.sectionTitle}>This Week</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Calendar size={24} color="#3b82f6" />
            <Text style={styles.statValue}>{weeklyCount}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#22c55e" />
            <Text style={styles.statValue}>
              {recentSessions.length > 0 ? '↗' : '—'}
            </Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
          
          <View style={styles.statCard}>
            <User size={24} color="#f59e0b" />
            <Text style={styles.statValue}>{settings.bodyWeight}</Text>
            <Text style={styles.statLabel}>lbs</Text>
          </View>
        </View>
      </View>

      <View style={styles.recent}>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        {recentSessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No workouts yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start your first workout to see it here
            </Text>
          </View>
        ) : (
          <View style={styles.recentList}>
            {recentSessions.map((session, index) => (
              <View key={session.id} style={styles.recentItem}>
                <View style={styles.recentItemHeader}>
                  <Text style={styles.recentItemTitle}>
                    {getDayTitle(session.dayType)}
                  </Text>
                  <Text style={styles.recentItemDate}>
                    {formatDate(session.date)}
                  </Text>
                </View>
                <Text style={styles.recentItemDetails}>
                  {session.duration ? `${session.duration} min` : 'In progress'} • {session.exercises.length} exercises
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  quickStart: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  workoutButtons: {
    gap: 12,
  },
  workoutButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    padding: 20,
    position: 'relative',
  },
  suggestedWorkout: {
    backgroundColor: '#22c55e',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  workoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  workoutButtonText: {
    flex: 1,
  },
  workoutButtonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  workoutButtonSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  suggestedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  suggestedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#22c55e',
  },
  stats: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  recent: {
    padding: 20,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  recentList: {
    gap: 8,
  },
  recentItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recentItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  recentItemDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  recentItemDetails: {
    fontSize: 12,
    color: '#9ca3af',
  },
});