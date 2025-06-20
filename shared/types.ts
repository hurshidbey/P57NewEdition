// Client-safe types (no drizzle-orm imports)
export interface User {
  id: number;
  username: string;
  password: string;
  tier: string;
  paidAt: Date | null;
}

export interface Protocol {
  id: number;
  number: number;
  title: string;
  description: string;
  badExample: string | null;
  goodExample: string | null;
  categoryId: number;
  notes: string | null;
  createdAt: Date | null;
  problemStatement: string | null;
  whyExplanation: string | null;
  solutionApproach: string | null;
  difficultyLevel: string | null;
  levelOrder: number | null;
  isFreeAccess: boolean;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface UserProgress {
  id: number;
  userId: string;
  protocolId: number;
  completedAt: Date | null;
  practiceCount: number | null;
  lastScore: number | null;
}

export interface InsertProtocol {
  number: number;
  title: string;
  description: string;
  badExample?: string;
  goodExample?: string;
  categoryId: number;
  notes?: string;
  problemStatement?: string;
  whyExplanation?: string;
  solutionApproach?: string;
  difficultyLevel?: string;
  levelOrder?: number;
}

export interface InsertCategory {
  name: string;
  description?: string;
}

export interface InsertUserProgress {
  userId: string;
  protocolId: number;
  practiceCount?: number;
  lastScore?: number;
}