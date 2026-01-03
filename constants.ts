
import { PoolCapacity, PoolStatus, User, Pool } from './types';

export const ADMIN_FEE_PERCENT = 0.30;
export const RESERVE_FEE_PERCENT = 0.10;
export const PRIZE_POOL_PERCENT = 0.60;

export const PRIZE_DISTRIBUTION = {
  TIER_1: 0.75,
  TIER_2: 0.15,
  TIER_3: 0.10,
};

export const MOCK_USER: User = {
  id: 'user-1',
  name: 'João Silva',
  phone: '(11) 98888-7777',
  email: 'joao@bolao.com',
  isAdmin: true
};

export const MOCK_POOLS: Pool[] = [
  {
    id: 'pool-1',
    name: 'Mega da Sorte #42',
    description: 'O bolão mais tradicional do bairro.',
    capacity: PoolCapacity.A,
    price: 50,
    status: PoolStatus.IN_PROGRESS,
    participantsIds: Array(85).fill('id'),
    draws: [
      { id: 1, date: '2024-05-20', numbers: [4, 12, 25, 33, 41, 58] },
      { id: 2, date: '2024-05-22', numbers: [] },
      { id: 3, date: '2024-05-24', numbers: [] },
    ],
    adminId: 'user-1',
    createdAt: '2024-05-15'
  },
  {
    id: 'pool-2',
    name: 'Super Bolão D',
    description: 'Mil participantes, prêmio gigante!',
    capacity: PoolCapacity.D,
    price: 20,
    status: PoolStatus.AWAITING,
    participantsIds: Array(450).fill('id'),
    draws: [],
    adminId: 'user-1',
    createdAt: '2024-05-18'
  }
];
