import { WorkoutPlan } from '@/types/workout';

export const defaultWorkoutPlan: WorkoutPlan = {
  Day1: [
    {
      id: 'hip-thrusts',
      name: 'Barbell Hip Thrusts',
      targetSets: 4,
      targetReps: 30,
    },
    {
      id: 'chest-press',
      name: 'Dumbbell Chest Press',
      targetSets: 3,
      targetReps: 15,
      isSuperset: true,
      supersetWith: ['goblet-squat'],
    },
    {
      id: 'goblet-squat',
      name: 'Goblet Squat',
      targetSets: 3,
      targetReps: 20,
      isSuperset: true,
      supersetWith: ['chest-press'],
    },
    {
      id: 'glute-kickbacks',
      name: 'Cable Glute Kickbacks',
      targetSets: 3,
      targetReps: 25,
      notes: '20-30 per leg',
    },
    {
      id: 'chest-fly',
      name: 'Chest Fly',
      targetSets: 3,
      targetReps: 15,
      isSuperset: true,
      supersetWith: ['step-ups'],
    },
    {
      id: 'step-ups',
      name: 'Step-Ups',
      targetSets: 3,
      targetReps: 15,
      isSuperset: true,
      supersetWith: ['chest-fly'],
      notes: '15 each leg',
    },
    {
      id: 'overhead-triceps',
      name: 'Seated Overhead Triceps Extension',
      targetSets: 3,
      targetReps: 15,
    },
    {
      id: 'triceps-pushdown',
      name: 'Cable Triceps Pushdown',
      targetSets: 3,
      targetReps: 15,
    },
  ],
  Day2: [
    {
      id: 'lat-pulldown',
      name: 'Lat Pulldown',
      targetSets: 3,
      targetReps: 15,
      isSuperset: true,
      supersetWith: ['seated-row'],
    },
    {
      id: 'seated-row',
      name: 'Seated Row',
      targetSets: 3,
      targetReps: 15,
      isSuperset: true,
      supersetWith: ['lat-pulldown'],
    },
    {
      id: 'lateral-raises',
      name: 'Dumbbell Lateral Raises',
      targetSets: 3,
      targetReps: 20,
      isSuperset: true,
      supersetWith: ['upright-row'],
    },
    {
      id: 'upright-row',
      name: 'Upright Row',
      targetSets: 3,
      targetReps: 20,
      isSuperset: true,
      supersetWith: ['lateral-raises'],
    },
    {
      id: 'romanian-deadlifts',
      name: 'Romanian Deadlifts',
      targetSets: 3,
      targetReps: 20,
    },
    {
      id: 'incline-curls',
      name: 'Incline Dumbbell Curls',
      targetSets: 3,
      targetReps: 17,
      notes: '15-20 reps',
    },
    {
      id: 'abs-circuit',
      name: 'Lower Abs Circuit',
      targetSets: 3,
      targetReps: 1,
      notes: 'Hanging leg raises (x15), Russian Twist, Side V ups (x20/side), Side plank dips (x10/side)',
    },
  ],
};