export interface Workout {
  id: number;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  body_part: string,
  created_at?: string;
  user_id?: number;
}

export interface UserProfile {
  username: string;
  email: string;
  total_workouts: number;
  total_volume: number;
  streak: number;
  weekly_goal?: number;
}
