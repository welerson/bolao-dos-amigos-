
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc, collection, addDoc, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Pool, Guess, Draw, PoolStatus, AccessCode, User, GameType } from '../types';
import { formatCurrency, calculateFinances, calculateScores, generateRanking, fetchMegaSenaResult } from '../utils';
import { NumberGrid } from '../components/NumberGrid';
import { ReportModal } from '../components/ReportModal';
import { GAME_CONFIG } from '../constants';

interface PoolDetailProps {
  pools: Pool[];
  setPools: React.Dispatch<React.SetStateAction<Pool[]>>;
  guesses: Guess[];
  onSaveGuess: (guess: Guess) => void;
  userId: string;
  notify?: (msg: string) => void;
  isAdmin?: boolean;
}

const PoolDetail: React.FC<PoolDetailProps> = ({ pools, guesses, onSaveGuess, userId, notify, isAdmin }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'participants' | 'guess' | 'results' | 'ranking' | 'codes'>('guess');
  const [showReport, setShowReport] = useState(false);
  const [poolCodes, setPoolCodes] = useState<AccessCode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  
  const pool = pools.find(p => p.id === id);
  const gameConfig = pool ? GAME_CONFIG[pool.gameType || GameType.MEGA_SENA] : GAME_CONFIG[GameType.MEGA_SENA];
  
  // Define a quantidade de números necessária vinda do banco ou do config (fallback)
  const picksRequired = pool?.requiredPicks || gameConfig.requiredPicks;
  
  const myGuesses = useMemo(() => guesses.filter(g => g.poolId === id && g.userId === userId), [guesses, id, userId]);
  const [selectedGuessIndex, setSelectedGuessIndex] = useState(0);
  const currentMyGuess = myGuesses[selectedGuessIndex];
  const [localNumbers, setLocalNumbers] = useState<number[]>([]);

  useEffect(() => {
    if (currentMyGuess) setLocalNumbers(currentMyGuess.numbers);
    else setLocalNumbers([]);
  }, [currentMyGuess]);

  useEffect(() => {
    if (pool && isAdmin) {
      const fetchUsers = async () => {
        const snap = await getDocs(collection(db, 'users'));
        const mapping: Record<string, string> = {};
        snap.forEach(doc => mapping[doc.id] = (doc.data() as User).name);
        setUsersMap(mapping);
      };
      fetchUsers();
    }
  }, [pool, isAdmin]);

  useEffect(() => {
    if (pool && isAdmin) {
      const q = query(collection(db, 'pool_codes'), where('poolId', '==', pool.id));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setPoolCodes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AccessCode)));
      });
      return () => unsubscribe();
    }
  }, [pool, isAdmin]);

  if (!pool) return <div className="p-8 text-center font-bold">Carregando bolão...</div>;

  const finances = calculateFinances(pool.participantsIds.length, pool.price);
  const poolGuesses = useMemo(() => guesses.filter(g => g.poolId === id), [guesses, id]);
  
  const allScores = calculateScores(poolGuesses, pool.draws);
  const ranking = generateRanking(allScores, [], finances.weeklyPrizePool);
  const isUserAdmin = isAdmin || pool.adminId === userId;
  const isCurrentGuessLocked = currentMyGuess && currentMyGuess.numbers.length === picksRequired;

  const handleSaveGuess = () => {
    if (pool.status === PoolStatus.FINISHED || isCurrentGuessLocked) return;
    if (localNumbers.length !== picksRequired) {
      alert(`Selecione exatamente ${picksRequired} números!`);
      return;
    }
    if (!confirm("Confirmar palpite? Não poderá ser alterado.")) return;

    onSaveGuess({
      id: currentMyGuess?.id || `${pool.id}_${userId}_${Date.now()}`,
      poolId: pool.id,
      userId,
      numbers: localNumbers
    });
  };

  const handleGenerateCode = async () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    await addDoc(collection(db, 'pool_codes'), { code, poolId: pool.id, used: false, createdAt: new Date().toISOString() });
    if (notify) notify("Código gerado!");
  };

  return (
    <div className={`flex-1 flex flex-col h-screen overflow-hidden bg-gray-50`}>
      <header className="p-4 bg-white flex items-center justify-between border-b border-gray-100 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-2xl">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h2 className="font-black text-gray-800 leading-none truncate max-w-[150px]">{pool.name}</h2>
            <span className={`text-[9px] font-black uppercase tracking-widest ${gameConfig.theme.text}`}>
              {gameConfig.name} • {pool.status}
            </span>
          </div>
        </div>
      </header>

      <div className="flex bg-white overflow-x-auto no-scrollbar border-b border-gray-100 shadow-sm z-10">
        {['Meu Jogo', 'Sorteios', 'Ranking', 'Participantes', ...(isAdmin ? ['Códigos'] : [])].map((label, idx) => {
          const tabId = label.toLowerCase().replace(' ', '') === 'meujogo' ? 'guess' : label.toLowerCase();
          return (
            <button key={idx} onClick={() => setActiveTab(tabId as any)} className={`px-5 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap border-b-[3px] transition-all ${activeTab === tabId ? `border-${gameConfig.color}-600 ${gameConfig.theme.text}` : 'border-transparent text-gray-400'}`}>
              {label}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-28 no-scrollbar space-y-6">
        {activeTab === 'guess' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {myGuesses.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {myGuesses.map((_, i) => (
                        <button key={i} onClick={() => setSelectedGuessIndex(i)} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${selectedGuessIndex === i ? `${gameConfig.theme.bg} text-white shadow-lg` : 'bg-white text-gray-400 border border-gray-100'}`}>
                            Cota {i + 1}
                        </button>
                    ))}
                </div>
            )}

            <div className={`p-8 rounded-[48px] shadow-2xl relative overflow-hidden text-white ${isCurrentGuessLocked ? gameConfig.theme.dark : gameConfig.theme.bg}`}>
               <div className="relative z-10">
                 <h3 className="text-2xl font-black leading-tight mb-4">Suas<br/>{picksRequired} Dezenas</h3>
                 <div className="grid grid-cols-5 gap-2">
                   {Array.from({length: picksRequired}).map((_, i) => {
                     const n = localNumbers.sort((a,b)=>a-b)[i];
                     return (
                       <div key={i} className={`aspect-square rounded-xl flex items-center justify-center font-black text-[10px] shadow-inner ${n ? 'bg-white/20 border border-white/30' : 'bg-black/10 text-white/20'}`}>
                         {n ? n.toString().padStart(2, '0') : '--'}
                       </div>
                     );
                   })}
                 </div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-[40px] shadow-sm border border-gray-100">
              <NumberGrid 
                selected={localNumbers} 
                onChange={setLocalNumbers} 
                disabled={isCurrentGuessLocked || pool.status === PoolStatus.FINISHED} 
                maxRange={gameConfig.maxNumbers}
                limit={picksRequired}
              />
            </div>

            {!isCurrentGuessLocked && (
              <button onClick={handleSaveGuess} className={`w-full ${gameConfig.theme.bg} text-white font-black py-6 rounded-[28px] shadow-xl hover:opacity-90 active:scale-95 transition-all`}>
                Salvar Palpite Permanentemente
              </button>
            )}
          </div>
        )}

        {/* Participantes e Financeiro */}
        {activeTab === 'participants' && (
           <div className="space-y-4">
              {isAdmin && (
                <div className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-sm mb-6">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Relatório de Gestão</p>
                  <div className="flex justify-between items-end mb-4">
                     <div>
                        <p className="text-xs font-bold text-gray-400">Arrecadação Total</p>
                        <p className="text-xl font-black text-gray-800">{formatCurrency(finances.totalCollected)}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-emerald-600 uppercase">Taxa App</p>
                        <p className="text-sm font-black text-emerald-600">-{formatCurrency(finances.appFee)}</p>
                     </div>
                  </div>
                </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
};

export default PoolDetail;
