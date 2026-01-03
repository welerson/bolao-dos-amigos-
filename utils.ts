
import { GoogleGenAI } from "@google/genai";
import { 
  ADMIN_FEE_PERCENT, 
  RESERVE_FEE_PERCENT, 
  PRIZE_POOL_PERCENT, 
  PRIZE_DISTRIBUTION 
} from './constants';
import { Score, RankingEntry, User, Guess, Draw } from './types';

// A inicialização é feita sob demanda para evitar erros de ReferenceError em alguns browsers
const getAI = () => {
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const generateAIGuess = async (): Promise<number[]> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Gere 12 números aleatórios e únicos entre 1 e 60 para um sorteio da Mega-Sena. Retorne apenas os números separados por vírgula, sem texto adicional.",
    });
    const text = response.text || "";
    const numbers = text.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n >= 1 && n <= 60);
    return numbers.slice(0, 12).sort((a, b) => a - b);
  } catch (error) {
    console.error("Gemini Error:", error);
    return Array.from({ length: 12 }, () => Math.floor(Math.random() * 60) + 1).sort((a, b) => a - b);
  }
};

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
        userName: user?.name || `Usuário ${w.userId.substring(0, 5)}`,
        rank: tierIndex + 1,
        prizeValue: prizePerPerson
      });
    });
  };

  addEntries(0, finances.tier1);
  addEntries(1, finances.tier2);
  addEntries(2, finances.tier3);

  sortedScores.forEach(s => {
    if (!ranking.find(r => r.userId === s.userId)) {
      const user = users.find(u => u.id === s.userId);
      ranking.push({ ...s, userName: user?.name || `Usuário ${s.userId.substring(0, 5)}`, rank: 0, prizeValue: 0 });
    }
  });
  return ranking;
};

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

export const fetchMegaSenaResult = async (): Promise<number[]> => {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 60) + 1).sort((a, b) => a - b);
};
