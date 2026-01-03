
export enum PoolCapacity {
  A = 100,
  B = 300,
  C = 500,
  D = 1000
}

export enum PoolStatus {
  AWAITING = 'Aguardando participantes',
  FULL = 'Lotado',
  IN_PROGRESS = 'Em andamento',
  FINISHED = 'Encerrado'
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  isAdmin: boolean;
}

export interface Draw {
  id: number; // 1, 2, or 3
  date: string;
  numbers: number[]; // 6 numbers
}

export interface AccessCode {
  id: string;
  code: string;
  poolId: string;
  used: boolean;
  usedBy?: string;
}

export interface Pool {
  id: string;
  name: string;
  description: string;
  capacity: PoolCapacity;
  price: number;
  status: PoolStatus;
  participantsIds: string[];
  draws: Draw[];
  adminId: string;
  createdAt: string;
}

export interface Guess {
  id: string;
  poolId: string;
  userId: string;
  numbers: number[]; // 18 numbers
}

export interface Score {
  userId: string;
  drawScores: number[]; // scores for each of the 3 draws
  totalScore: number;
}

export interface FinancialReport {
  totalCollected: number;
  adminFee: number;
  reserveFee: number;
  weeklyPrizePool: number;
  tier1Total: number;
  tier2Total: number;
  tier3Total: number;
}

export interface RankingEntry extends Score {
  userName: string;
  rank: number; // 1, 2, or 3
  prizeValue: number;
}
