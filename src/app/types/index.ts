export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  friends: string[];
  pendingRequests: string[];
  streakScore: number;
} 