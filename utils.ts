
import { 
  ADMIN_FEE_PERCENT, 
  RESERVE_FEE_PERCENT, 
  PRIZE_POOL_PERCENT, 
  PRIZE_DISTRIBUTION,
  APP_PLATFORM_FEE
} from './constants';
import { Score, RankingEntry, User, Guess, Draw } from './types';

export const calculateFinances = (participantsCount: number, pricePerPerson: number) => {
  const totalCollectedRaw = participantsCount * pricePerPerson;
  // A taxa do app é retirada do valor total (R$ 10 por participante)
  const appTotalFee = participantsCount * APP_PLATFORM_FEE;
  const totalForPool = totalCollectedRaw - appTotalFee;
  
  const adminFee = totalForPool * ADMIN_FEE_PERCENT;
  const reserveFee = totalForPool * RESERVE_FEE_PERCENT;
  const weeklyPrizePool = totalForPool * PRIZE_POOL_PERCENT;

  return {
    totalCollected: totalCollectedRaw,
    appFee: appTotalFee,
    poolNetValue: totalForPool,
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
        userName: user?.name || `Usuário ${w.userId.substring(0, 5)}`,
        rank: tierIndex + 1,
        prizeValue: prizePerPerson
      });
    });
  };

  addEntries(0, poolTotalPrize * PRIZE_DISTRIBUTION.TIER_1);
  addEntries(1, poolTotalPrize * PRIZE_DISTRIBUTION.TIER_2);
  addEntries(2, poolTotalPrize * PRIZE_DISTRIBUTION.TIER_3);

  return ranking;
};

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

export const fetchMegaSenaResult = async (): Promise<number[]> => {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 60) + 1).sort((a, b) => a - b);
};
