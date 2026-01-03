
import { GameType } from './types';

export const APP_PLATFORM_FEE = 10.00; // Taxa de 10 reais por jogo/cota
export const ADMIN_FEE_PERCENT = 0.20; // Reduzido para acomodar a taxa fixa
export const RESERVE_FEE_PERCENT = 0.10;
export const PRIZE_POOL_PERCENT = 0.70;

export const GAME_CONFIG = {
  [GameType.MEGA_SENA]: {
    name: 'Mega-Sena',
    maxNumbers: 60,
    requiredPicks: 18,
    color: 'emerald',
    theme: {
      bg: 'bg-emerald-600',
      text: 'text-emerald-600',
      light: 'bg-emerald-50',
      border: 'border-emerald-100',
      dark: 'bg-emerald-900'
    }
  },
  [GameType.LOTOFACIL]: {
    name: 'Lotofácil',
    maxNumbers: 25,
    requiredPicks: 15,
    color: 'purple',
    theme: {
      bg: 'bg-purple-600',
      text: 'text-purple-600',
      light: 'bg-purple-50',
      border: 'border-purple-100',
      dark: 'bg-purple-900'
    }
  }
};

export const PRIZE_DISTRIBUTION = {
  TIER_1: 0.75,
  TIER_2: 0.15,
  TIER_3: 0.10,
};
