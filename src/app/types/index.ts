export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  friends: User[];
  pendingRequests: string[];
  streakScore: number;
} 