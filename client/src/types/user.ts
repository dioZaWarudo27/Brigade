export interface User {
  id: number;
  email: string;
  password_hash: string;
  username: string | null;
  weekly_goal: number | null;
  created_at?: Date;
}

// Data you'll actually send back to the React app (safe, no password)
export type UserResponse = Omit<User, 'password_hash'>;

// For when you're creating a new user (the input)
export type CreateUserInput = Pick<User, 'email' | 'password_hash'>;
