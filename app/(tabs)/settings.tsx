import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { User, Scale, Calendar, Download, Trash2, CreditCard as Edit } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserSettings, saveUserSettings, getWorkoutSessions, exportWorkoutData } from '@/utils/storage';
import { UserSettings } from '@/types/workout';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<UserSettings>({
    bodyWeight: 150,
    weekStartsWithDay1: true,
  });
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [tempWeight, setTempWeight] = useState('150');
  const [totalWorkouts, setTotalWorkouts] = useState(0);

  useEffect(() => {
    loadSettings();
    loadWorkoutCount();
  }, []);

  const loadSettings = async () => {
    try {
      const userSettings = await getUserSettings();
      setSettings(userSettings);
      setTempWeight(userSettings.bodyWeight.toString());
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadWorkoutCount = async () => {
    try {
      const sessions = await getWorkoutSessions();
      setTotalWorkouts(sessions.filter(s => s.completed).length);
    } catch (error) {
      console.error('Error loading workout count:', error);
    }
  };

  const handleSaveWeight = async () => {
    try {
      const weight = parseFloat(tempWeight);
      if (isNaN(weight) || weight <= 0) {
        Alert.alert('Invalid Weight', 'Please enter a valid weight.');
        return;
      }

      const updatedSettings = {
        ...settings,
        bodyWeight: weight,
      };

      await saveUserSettings(updatedSettings);
      setSettings(updatedSettings);
      setIsEditingWeight(false);
    } catch (error) {
      console.error('Error saving weight:', error);
      Alert.alert('Error', 'Failed to save weight. Please try again.');
    }
  };

  const handleToggleWeekStart = async () => {
    try {
      const updatedSettings = {
        ...settings,
        weekStartsWithDay1: !settings.weekStartsWithDay1,
      };

      await saveUserSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating week start:', error);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = await exportWorkoutData();
      // In a real app, this would trigger a download
      console.log('Export data:', exportData);
      Alert.alert(
        'Export Complete',
        'Your workout data has been exported. In a real app, this would download a JSON file with all your workout history.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all workout data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear data by setting empty arrays
              await AsyncStorage.removeItem('workout_sessions');
              await AsyncStorage.removeItem('user_settings');
              
              // Reset to default settings
              const defaultSettings: UserSettings = {
                bodyWeight: 150,
                weekStartsWithDay1: true,
              };
              
              await saveUserSettings(defaultSettings);
              setSettings(defaultSettings);
              setTempWeight('150');
              setTotalWorkouts(0);
              
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Scale size={20} color="#3b82f6" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Body Weight</Text>
              <Text style={styles.settingDescription}>
                Track your weight for progress monitoring
              </Text>
            </View>
            <View style={styles.settingValue}>
              {isEditingWeight ? (
                <View style={styles.weightEdit}>
                  <TextInput
                    style={styles.weightInput}
                    value={tempWeight}
                    onChangeText={setTempWeight}
                    keyboardType="numeric"
                    placeholder="150"
                  />
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveWeight}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditingWeight(true)}
                >
                  <Text style={styles.weightText}>{settings.bodyWeight} lbs</Text>
                  <Edit size={16} color="#6b7280" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Preferences</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleToggleWeekStart}>
            <View style={styles.settingIcon}>
              <Calendar size={20} color="#3b82f6" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Week Start</Text>
              <Text style={styles.settingDescription}>
                {settings.weekStartsWithDay1 ? 'Start new weeks with Day 1' : 'Start new weeks with Day 2'}
              </Text>
            </View>
            <View style={styles.toggle}>
              <View style={[
                styles.toggleTrack,
                settings.weekStartsWithDay1 && styles.toggleTrackActive
              ]}>
                <View style={[
                  styles.toggleThumb,
                  settings.weekStartsWithDay1 && styles.toggleThumbActive
                ]} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          
          <View style={styles.statItem}>
            <View style={styles.settingIcon}>
              <User size={20} color="#22c55e" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Total Workouts</Text>
              <Text style={styles.settingDescription}>
                Completed workout sessions
              </Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.statValue}>{totalWorkouts}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleExportData}>
            <View style={styles.settingIcon}>
              <Download size={20} color="#3b82f6" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Export Data</Text>
              <Text style={styles.settingDescription}>
                Download your workout history as JSON
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleClearData}>
            <View style={styles.settingIcon}>
              <Trash2 size={20} color="#ef4444" />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: '#ef4444' }]}>Clear All Data</Text>
              <Text style={styles.settingDescription}>
                Remove all workout history and reset settings
              </Text>
            </View>
          </TouchableOpacity>
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingValue: {
    alignItems: 'flex-end',
  },
  weightEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weightInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    width: 80,
    textAlign: 'center',
    backgroundColor: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weightText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  toggle: {
    width: 50,
    height: 30,
  },
  toggleTrack: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    padding: 2,
  },
  toggleTrackActive: {
    backgroundColor: '#3b82f6',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#22c55e',
  },
});