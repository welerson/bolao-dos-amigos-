
import { 
  ADMIN_FEE_PERCENT, 
  RESERVE_FEE_PERCENT, 
  PRIZE_POOL_PERCENT, 
  PRIZE_DISTRIBUTION 
} from './constants';
import { Score, RankingEntry, User, Guess, Draw, Pool } from './types';

export const calculateFinances = (participantsCount: number, pricePerPerson: number) => {
  const totalCollected = participantsCount * pricePerPerson;
  const adminFee = totalCollected * ADMIN_FEE_PERCENT;
  const reserveFee = totalCollected * RESERVE_FEE_PERCENT;
  const weeklyPrizePool = totalCollected * PRIZE_POOL_PERCENT;

  return {
    totalCollected,
    adminFee,
    reserveFee,
    weeklyPrizePool,
    tier1Pool: weeklyPrizePool * PRIZE_DISTRIBUTION.TIER_1,
    tier2Pool: weeklyPrizePool * PRIZE_DISTRIBUTION.TIER_2,
    tier3Pool: weeklyPrizePool * PRIZE_DISTRIBUTION.TIER_3,
  };
};

export const calculateScores = (guesses: Guess[], draws: Draw[]): Score[] => {
  return guesses.map(guess => {
    const drawScores = draws.map(draw => {
      if (!draw.numbers || draw.numbers.length === 0) return 0;
      return guess.numbers.filter(num => draw.numbers.includes(num)).length;
    });
    const totalScore = drawScores.reduce((sum, score) => sum + score, 0);
    return { userId: guess.userId, drawScores, totalScore };
  });
};

export const generateRanking = (
  scores: Score[], 
  users: User[], 
  poolTotalPrize: number
): RankingEntry[] => {
  const sortedScores = [...scores].sort((a, b) => b.totalScore - a.totalScore);
  const distinctScores = Array.from(new Set(sortedScores.map(s => s.totalScore))).sort((a, b) => b - a);

  const finances = {
    tier1: poolTotalPrize * PRIZE_DISTRIBUTION.TIER_1,
    tier2: poolTotalPrize * PRIZE_DISTRIBUTION.TIER_2,
    tier3: poolTotalPrize * PRIZE_DISTRIBUTION.TIER_3,
  };

  const ranking: RankingEntry[] = [];

  const addEntries = (tierIndex: number, totalTierPrize: number) => {
    const targetScore = distinctScores[tierIndex];
    if (targetScore === undefined) return;
    
    const winners = sortedScores.filter(s => s.totalScore === targetScore);
    const prizePerPerson = winners.length > 0 ? totalTierPrize / winners.length : 0;
    
    winners.forEach(w => {
      const user = users.find(u => u.id === w.userId);
      ranking.push({
        ...w,
        userName: user?.name || `Usuário ${w.userId.split('-')[1] || w.userId}`,
        rank: tierIndex + 1,
        prizeValue: prizePerPerson
      });
    });
  };

  addEntries(0, finances.tier1);
  addEntries(1, finances.tier2);
  addEntries(2, finances.tier3);

  // Add the rest
  sortedScores.forEach(s => {
    if (!ranking.find(r => r.userId === s.userId)) {
      const user = users.find(u => u.id === s.userId);
      ranking.push({
        ...s,
        userName: user?.name || `Usuário ${s.userId.split('-')[1] || s.userId}`,
        rank: 0,
        prizeValue: 0
      });
    }
  });

  return ranking;
};

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

// Simulation of Mega-Sena API
export const fetchMegaSenaResult = async (): Promise<number[]> => {
  // In a real app, use: await fetch('https://loteriascaixa-api.herokuapp.com/api/megasena/latest')
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 60) + 1).sort((a, b) => a - b);
};
