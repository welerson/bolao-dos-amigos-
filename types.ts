
export enum GameType {
  MEGA_SENA = 'MEGA_SENA',
  LOTOFACIL = 'LOTOFACIL'
}

export enum PoolBetType {
  INDIVIDUAL = 'INDIVIDUAL',
  COLLABORATIVE = 'COLLABORATIVE' // Números mais marcados pelos participantes
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
  numbers: number[]; 
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
  gameType: GameType;
  betType: PoolBetType;
  requiredPicks: number; // Quantos números o usuário marca
  officialTicketSize: number; // Tamanho do bilhete oficial (ex: 14 números)
  capacity: number; // Mudado de PoolCapacity para number
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
  userName?: string;
  numbers: number[];
}

export interface Score {
  userId: string;
  drawScores: number[];
  totalScore: number;
}

export interface RankingEntry extends Score {
  userName: string;
  rank: number;
  prizeValue: number;
}
