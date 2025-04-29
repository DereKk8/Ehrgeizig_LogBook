//data entity DB tables

export type User = {
  id: string;
  email: string;
  created_at: string;
  user_name: string;
  remember_me_device?: string;
};

export type Split = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type SplitDay = {
  id: string;
  split_id: string;
  day_of_week: number;
  name: string;
  is_rest_day: boolean;
};

export type Exercise = {
  id: string;
  split_day_id: string;
  name: string;
  default_sets: number;
  rest_time_sec: number;
  note?: string;
  exercise_order: number;
  muscle_groups?: string[]; // Array of muscle group IDs
};

export type Session = {
  id: string;
  user_id: string;
  split_day: string;
  date: string;
  created_at: string;
};

export type Set = {
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  reps: number;
  weight: number;
};

// Database enums
export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

// Muscle Group options
export enum MuscleGroup {
  Chest = "Chest",
  Biceps = "Biceps",
  Triceps = "Triceps",
  Quads = "Quads",
  Hamstrings = "Hamstrings",
  Back = "Back",
  Shoulders = "Shoulders"
}

// All available muscle groups as an array for selection
export const MUSCLE_GROUPS = Object.values(MuscleGroup);

