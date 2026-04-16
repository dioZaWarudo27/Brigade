export interface Workout {
  id: number;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  user_id: number;
  created_at?: Date;
}

// Data needed when logging a new workout (don't need id or created_at yet)
export type CreateWorkoutInput = Omit<Workout, 'id' | 'created_at'>;

// Data when updating a workout (everything optional except id)
export interface UpdateWorkoutInput {
  exercise?: string;
  sets?: number;
  reps?: number;
  weight?: number;
}
