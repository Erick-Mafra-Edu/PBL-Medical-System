export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  avatar?: string;
  
  // Settings
  preferences: UserPreferences;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface UserPreferences {
  defaultAlgorithm: 'sm2' | 'fsrs' | 'leitner';
  dailyGoal: number; // number of cards to review per day
  notificationsEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserDTO {
  name?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  token: string;
  expiresIn: number;
}
