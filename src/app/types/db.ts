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
};

export type Exercise = {
  id: string;
  split_day_id: string;
  name: string;
  default_sets: number;
  rest_time_sec: number;
  note?: string;
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

