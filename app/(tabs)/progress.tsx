import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, TrendingUp, ChartBar as BarChart3, Download } from 'lucide-react-native';
import { getWorkoutSessions, exportWorkoutData } from '@/utils/storage';
import { WorkoutSession } from '@/types/workout';
import { formatDate, formatTime } from '@/utils/workoutHelper';

export default function ProgressScreen() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const allSessions = await getWorkoutSessions();
      setSessions(allSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const getFilteredSessions = () => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'all':
        return sessions;
    }
    
    return sessions.filter(session => new Date(session.date) >= cutoffDate);
  };

  const filteredSessions = getFilteredSessions();

  const getStats = () => {
    const completed = filteredSessions.filter(s => s.completed);
    const totalWorkouts = completed.length;
    const totalTime = completed.reduce((sum, session) => sum + (session.duration || 0), 0);
    const avgTime = totalWorkouts > 0 ? totalTime / totalWorkouts : 0;
    
    const day1Count = completed.filter(s => s.dayType === 'Day1').length;
    const day2Count = completed.filter(s => s.dayType === 'Day2').length;
    
    return {
      totalWorkouts,
      totalTime,
      avgTime,
      day1Count,
      day2Count,
    };
  };

  const stats = getStats();

  const getDayTitle = (dayType: 'Day1' | 'Day2') => {
    return dayType === 'Day1' 
      ? 'Chest, Triceps, Quads/Glutes'
      : 'Back, Shoulders, Biceps, Abs';
  };

  const handleExportData = async () => {
    try {
      const exportData = await exportWorkoutData();
      // In a real app, this would trigger a download
      console.log('Export data:', exportData);
      // For now, just show an alert
      alert('Export data logged to console (in a real app this would download a file)');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
        <TouchableOpacity style={styles.exportButton} onPress={handleExportData}>
          <Download size={20} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <View style={styles.periodSelector}>
        {(['week', 'month', 'all'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive,
              ]}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Calendar size={24} color="#3b82f6" />
              <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>Total Workouts</Text>
            </View>
            
            <View style={styles.statCard}>
              <TrendingUp size={24} color="#22c55e" />
              <Text style={styles.statValue}>
                {stats.avgTime > 0 ? `${Math.round(stats.avgTime)}m` : '—'}
              </Text>
              <Text style={styles.statLabel}>Avg Duration</Text>
            </View>
            
            <View style={styles.statCard}>
              <BarChart3 size={24} color="#f59e0b" />
              <Text style={styles.statValue}>
                {stats.totalTime > 0 ? `${Math.round(stats.totalTime / 60)}h` : '—'}
              </Text>
              <Text style={styles.statLabel}>Total Time</Text>
            </View>
          </View>
        </View>

        <View style={styles.splitSection}>
          <Text style={styles.sectionTitle}>Workout Split</Text>
          <View style={styles.splitGrid}>
            <View style={styles.splitCard}>
              <Text style={styles.splitNumber}>{stats.day1Count}</Text>
              <Text style={styles.splitLabel}>Day 1 Sessions</Text>
              <Text style={styles.splitSubtitle}>Chest, Triceps, Quads/Glutes</Text>
            </View>
            
            <View style={styles.splitCard}>
              <Text style={styles.splitNumber}>{stats.day2Count}</Text>
              <Text style={styles.splitLabel}>Day 2 Sessions</Text>
              <Text style={styles.splitSubtitle}>Back, Shoulders, Biceps, Abs</Text>
            </View>
          </View>
        </View>

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          {filteredSessions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No workouts found</Text>
              <Text style={styles.emptyStateSubtext}>
                Start tracking your workouts to see progress here
              </Text>
            </View>
          ) : (
            <View style={styles.sessionsList}>
              {filteredSessions.slice(0, 10).map((session) => (
                <View key={session.id} style={styles.sessionCard}>
                  <View style={styles.sessionHeader}>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionTitle}>
                        {getDayTitle(session.dayType)}
                      </Text>
                      <Text style={styles.sessionDate}>
                        {formatDate(session.date)}
                      </Text>
                    </View>
                    <View style={styles.sessionStats}>
                      <Text style={styles.sessionDuration}>
                        {session.duration ? `${session.duration}m` : 'In progress'}
                      </Text>
                      <View style={[
                        styles.sessionStatus,
                        session.completed ? styles.completedStatus : styles.inProgressStatus
                      ]}>
                        <Text style={[
                          styles.sessionStatusText,
                          session.completed ? styles.completedStatusText : styles.inProgressStatusText
                        ]}>
                          {session.completed ? 'Completed' : 'In Progress'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.sessionDetails}>
                    <Text style={styles.sessionExercises}>
                      {session.exercises.length} exercises
                    </Text>
                    {session.bodyWeight && (
                      <Text style={styles.sessionBodyWeight}>
                        Body weight: {session.bodyWeight}lbs
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
  },
  exportButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#dbeafe',
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#ffffff',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#3b82f6',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
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
    textAlign: 'center',
  },
  splitSection: {
    marginBottom: 24,
  },
  splitGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  splitCard: {
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
  splitNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#3b82f6',
    marginBottom: 4,
  },
  splitLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  splitSubtitle: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  historySection: {
    marginBottom: 24,
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
  sessionsList: {
    gap: 8,
  },
  sessionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  sessionDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  sessionStats: {
    alignItems: 'flex-end',
  },
  sessionDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 4,
  },
  sessionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedStatus: {
    backgroundColor: '#dcfce7',
  },
  inProgressStatus: {
    backgroundColor: '#fef3c7',
  },
  sessionStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  completedStatusText: {
    color: '#16a34a',
  },
  inProgressStatusText: {
    color: '#d97706',
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionExercises: {
    fontSize: 12,
    color: '#9ca3af',
  },
  sessionBodyWeight: {
    fontSize: 12,
    color: '#9ca3af',
  },
});