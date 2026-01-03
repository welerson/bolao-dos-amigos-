
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc, collection, addDoc, query, where, onSnapshot, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Pool, Guess, Draw, PoolStatus, AccessCode, User, GameType, PoolBetType } from '../types';
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
  const [activeTab, setActiveTab] = useState<'participants' | 'guess' | 'results' | 'ranking' | 'codes' | 'voted'>('guess');
  const [showReport, setShowReport] = useState(false);
  const [poolCodes, setPoolCodes] = useState<AccessCode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  
  const pool = pools.find(p => p.id === id);
  const gameConfig = pool ? GAME_CONFIG[pool.gameType || GameType.MEGA_SENA] : GAME_CONFIG[GameType.MEGA_SENA];
  const picksRequired = pool?.requiredPicks || gameConfig.requiredPicks;
  
  const poolGuesses = useMemo(() => guesses.filter(g => g.poolId === id), [guesses, id]);
  const myGuesses = useMemo(() => poolGuesses.filter(g => g.userId === userId), [poolGuesses, userId]);
  const [selectedGuessIndex, setSelectedGuessIndex] = useState(0);
  const currentMyGuess = myGuesses[selectedGuessIndex];
  const [localNumbers, setLocalNumbers] = useState<number[]>([]);

  // Lógica de Dezenas Mais Votadas
  const mostVotedNumbers = useMemo(() => {
    if (!pool || poolGuesses.length === 0) return [];
    const counts: Record<number, number> = {};
    poolGuesses.forEach(g => {
      g.numbers.forEach(n => {
        counts[n] = (counts[n] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([num, count]) => ({ num: parseInt(num), count }))
      .sort((a, b) => b.count - a.count || a.num - b.num);
  }, [poolGuesses, pool]);

  const officialTicket = useMemo(() => {
    if (!pool) return [];
    return mostVotedNumbers.slice(0, pool.officialTicketSize).map(x => x.num).sort((a, b) => a - b);
  }, [mostVotedNumbers, pool]);

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
  const allScores = calculateScores(poolGuesses, pool.draws);
  const ranking = generateRanking(allScores, [], finances.weeklyPrizePool);
  const isUserAdmin = isAdmin || pool.adminId === userId;
  const isCurrentGuessLocked = currentMyGuess && currentMyGuess.numbers.length === picksRequired;
  const isColab = pool.betType === PoolBetType.COLLABORATIVE;

  const handleSaveGuess = () => {
    if (pool.status === PoolStatus.FINISHED || isCurrentGuessLocked) return;
    if (localNumbers.length !== picksRequired) {
      alert(`Selecione exatamente ${picksRequired} números!`);
      return;
    }
    if (!confirm("Confirmar escolha? Não poderá ser alterado.")) return;

    onSaveGuess({
      id: currentMyGuess?.id || `${pool.id}_${userId}_${Date.now()}`,
      poolId: pool.id,
      userId,
      numbers: localNumbers
    });
  };

  const handleDeletePool = async () => {
    if (!window.confirm("ATENÇÃO: Você tem certeza que deseja excluir este bolão permanentemente? Esta ação não pode ser desfeita e removerá todos os dados deste grupo.")) return;
    
    try {
      await deleteDoc(doc(db, 'pools', pool.id));
      if (notify) notify("Bolão excluído com sucesso!");
      navigate('/home');
    } catch (e) {
      console.error(e);
      if (notify) notify("Erro ao excluir bolão.");
    }
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
            <p className={`text-[8px] font-black uppercase tracking-widest ${gameConfig.theme.text} mt-1`}>
              {gameConfig.name} • {isColab ? 'MAIS VOTADOS' : 'INDIVIDUAL'}
            </p>
          </div>
        </div>
      </header>

      <div className="flex bg-white overflow-x-auto no-scrollbar border-b border-gray-100 shadow-sm z-10">
        {[
          {id: 'guess', l: 'Meus Números'},
          ...(isColab ? [{id: 'voted', l: 'Votação do Grupo'}] : []),
          {id: 'results', l: 'Sorteios'},
          {id: 'ranking', l: 'Ranking'},
          {id: 'participants', l: 'Membros'},
          ...(isAdmin ? [{id: 'codes', l: 'Códigos'}] : [])
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-5 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap border-b-[3px] transition-all ${activeTab === tab.id ? `border-${gameConfig.color}-600 ${gameConfig.theme.text}` : 'border-transparent text-gray-400'}`}>
            {tab.l}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-28 no-scrollbar space-y-6">
        {activeTab === 'guess' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {isColab && (
               <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-3xl">
                  <p className="text-[10px] font-bold text-emerald-800 leading-tight">
                    Neste bolão, as dezenas mais votadas pelo grupo formarão o bilhete oficial de <span className="font-black">{pool.officialTicketSize} números</span>.
                  </p>
               </div>
            )}

            <div className={`p-8 rounded-[48px] shadow-2xl relative overflow-hidden text-white ${isCurrentGuessLocked ? gameConfig.theme.dark : gameConfig.theme.bg}`}>
               <div className="relative z-10">
                 <h3 className="text-2xl font-black leading-tight mb-4">Seu Palpite de<br/>{picksRequired} Dezenas</h3>
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
                Confirmar Escolha
              </button>
            )}
          </div>
        )}

        {activeTab === 'voted' && isColab && (
           <div className="space-y-8 animate-in fade-in duration-300">
              <section className="bg-emerald-900 text-white p-8 rounded-[48px] shadow-xl">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-50">Bilhete Oficial do Grupo</h4>
                 <p className="text-xs font-medium opacity-80 mb-6 leading-tight">Com base em {poolGuesses.length} participações, este é o jogo atual:</p>
                 <div className="grid grid-cols-5 gap-2">
                    {officialTicket.map((n, i) => (
                      <div key={i} className="aspect-square rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-sm border border-emerald-400 shadow-lg">
                        {n.toString().padStart(2, '0')}
                      </div>
                    ))}
                    {Array.from({length: Math.max(0, pool.officialTicketSize - officialTicket.length)}).map((_, i) => (
                       <div key={i} className="aspect-square rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 font-black">?</div>
                    ))}
                 </div>
              </section>

              <section className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Ranking de Votos das Dezenas</h4>
                 <div className="space-y-3">
                    {mostVotedNumbers.slice(0, 15).map((item, idx) => (
                       <div key={item.num} className="flex items-center gap-4">
                          <span className="w-8 font-black text-gray-300 text-[10px]">{idx + 1}º</span>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${officialTicket.includes(item.num) ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                             {item.num.toString().padStart(2, '0')}
                          </div>
                          <div className="flex-1 bg-gray-50 h-2 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-emerald-500 rounded-full" 
                                style={{ width: `${(item.count / poolGuesses.length) * 100}%` }}
                             ></div>
                          </div>
                          <span className="text-[10px] font-black text-gray-400">{item.count} votos</span>
                       </div>
                    ))}
                 </div>
              </section>
           </div>
        )}

        {activeTab === 'results' && (
           <div className="space-y-6">
              {pool.draws.map((draw, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                     <h4 className="font-black text-lg text-gray-800 tracking-tight">Sorteio #{draw.id}</h4>
                     <span className="text-[10px] text-gray-400 font-bold uppercase">{draw.date || 'Pendente'}</span>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {draw.numbers.length > 0 ? (
                      draw.numbers.map((n, i) => (
                        <div key={i} className="aspect-square rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-black text-lg shadow-lg">
                          {n}
                        </div>
                      ))
                    ) : (
                      Array(6).fill(0).map((_, i) => (
                        <div key={i} className="aspect-square rounded-2xl bg-gray-50 border border-gray-100 text-gray-200 flex items-center justify-center font-black">?</div>
                      ))
                    )}
                  </div>
                </div>
              ))}
           </div>
        )}

        {activeTab === 'participants' && (
           <div className="space-y-6">
              <div className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Financeiro do Grupo</p>
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-xs font-bold text-gray-400">Arrecadação Bruta</p>
                        <p className="text-xl font-black text-gray-800">{formatCurrency(finances.totalCollected)}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-emerald-600 uppercase">Líquido Premiação</p>
                        <p className="text-sm font-black text-emerald-600">{formatCurrency(finances.weeklyPrizePool)}</p>
                     </div>
                  </div>
              </div>

              {isUserAdmin && (
                <div className="p-4 bg-red-50 rounded-[32px] border border-red-100 mt-10">
                   <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-3 ml-2">Zona de Perigo</p>
                   <button 
                     onClick={handleDeletePool}
                     className="w-full bg-white text-red-600 font-black py-4 rounded-2xl shadow-sm border border-red-200 hover:bg-red-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     Excluir este Bolão
                   </button>
                </div>
              )}
           </div>
        )}

        {activeTab === 'codes' && isAdmin && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <button onClick={handleGenerateCode} className="w-full bg-gray-900 text-white font-black py-5 rounded-[24px] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              Gerar Novo Convite
            </button>
            <div className="space-y-3">
              {poolCodes.map(c => (
                <div key={c.id} className="bg-white p-5 rounded-[28px] border border-gray-100 flex justify-between items-center group">
                  <div>
                    <p className="text-xl font-black tracking-widest text-gray-800 uppercase">{c.code}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${c.used ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {c.used ? `Usado por ${usersMap[c.usedBy!] || 'Usuário'}` : 'Disponível'}
                    </p>
                  </div>
                  {!c.used && (
                    <button onClick={() => { navigator.clipboard.writeText(c.code); notify?.("Código copiado!"); }} className="p-3 bg-gray-50 rounded-xl group-hover:bg-emerald-50 transition-colors">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoolDetail;
