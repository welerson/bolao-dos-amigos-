
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc, collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Pool, Guess, Draw, PoolStatus, AccessCode } from '../types';
import { formatCurrency, calculateFinances, calculateScores, generateRanking, fetchMegaSenaResult, generateAIGuess } from '../utils';
import { NumberGrid } from '../components/NumberGrid';
import { ReportModal } from '../components/ReportModal';

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
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [poolCodes, setPoolCodes] = useState<AccessCode[]>([]);
  
  const pool = pools.find(p => p.id === id);
  const myGuess = guesses.find(g => g.poolId === id && g.userId === userId);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>(myGuess?.numbers || []);

  useEffect(() => {
    if (myGuess) setSelectedNumbers(myGuess.numbers);
  }, [myGuess]);

  // Monitorar códigos para admin
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
  const poolGuesses = guesses.filter(g => g.poolId === id);
  const allScores = calculateScores(poolGuesses, pool.draws);
  const ranking = generateRanking(allScores, [], finances.weeklyPrizePool);
  const isUserAdmin = isAdmin || pool.adminId === userId;

  const handleGenerateCode = async () => {
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      await addDoc(collection(db, 'pool_codes'), {
        code,
        poolId: pool.id,
        used: false,
        createdAt: new Date().toISOString()
      });
      if (notify) notify("Novo código gerado com sucesso!");
    } catch (e) {
      if (notify) notify("Erro ao gerar código.");
    }
  };

  const handleAIGuess = async () => {
    setIsGeneratingAI(true);
    if (notify) notify("Gemini escolhendo 18 dezenas...");
    const aiNumbers = await generateAIGuess();
    setSelectedNumbers(aiNumbers);
    setIsGeneratingAI(false);
  };

  const handleSaveGuess = () => {
    if (pool.status === PoolStatus.FINISHED) return;
    if (selectedNumbers.length !== 18) {
      alert('Selecione exatamente 18 números!');
      return;
    }
    onSaveGuess({
      id: `${pool.id}_${userId}`,
      poolId: pool.id,
      userId,
      numbers: selectedNumbers
    });
  };

  const handleUpdateDraw = async (drawIndex: number) => {
    if (!isUserAdmin) return;
    const choice = confirm('OK para buscar resultado oficial da Mega-Sena?');
    let numbers: number[] | undefined;
    if (choice) {
      numbers = await fetchMegaSenaResult();
    } else {
      const input = prompt('Insira os 6 números (separados por vírgula)');
      numbers = input?.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    }
    if (!numbers || numbers.length !== 6) return;
    try {
      const newDraws = [...pool.draws];
      newDraws[drawIndex] = { ...newDraws[drawIndex], numbers: numbers!, date: new Date().toLocaleDateString('pt-BR') };
      const filledCount = newDraws.filter(d => d.numbers.length === 6).length;
      let newStatus = pool.status;
      if (filledCount === 3) newStatus = PoolStatus.FINISHED;
      else if (filledCount > 0) newStatus = PoolStatus.IN_PROGRESS;
      await updateDoc(doc(db, 'pools', pool.id), { draws: newDraws, status: newStatus });
      if (notify) notify("Resultado da rodada atualizado!");
    } catch (e) {
      if (notify) notify("Erro na atualização.");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-screen overflow-hidden">
      <header className="p-4 bg-white flex items-center justify-between border-b border-gray-100 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-2xl transition-all">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h2 className="font-black text-gray-800 leading-none truncate max-w-[150px]">{pool.name}</h2>
            <span className={`text-[9px] font-black uppercase tracking-widest ${pool.status === PoolStatus.FINISHED ? 'text-blue-600' : 'text-emerald-500'}`}>
              {pool.status}
            </span>
          </div>
        </div>
        {pool.status === PoolStatus.FINISHED && (
          <button onClick={() => setShowReport(true)} className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </button>
        )}
      </header>

      <div className="flex bg-white overflow-x-auto no-scrollbar border-b border-gray-100 shadow-sm z-10">
        {[
          {id: 'guess', l: 'Meu Palpite'},
          {id: 'results', l: 'Sorteios'},
          {id: 'ranking', l: 'Ranking'},
          {id: 'participants', l: 'Grupo'},
          ...(isAdmin ? [{id: 'codes', l: 'Códigos'}] : [])
        ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-5 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap border-b-[3px] transition-all ${activeTab === tab.id ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400'}`}>
              {tab.l}
            </button>
          )
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-28 no-scrollbar space-y-6">
        {activeTab === 'guess' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-emerald-900 text-white p-8 rounded-[48px] shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                 <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-black leading-tight mb-2">Suas<br/>18 Dezenas</h3>
                    <button 
                      onClick={handleAIGuess}
                      disabled={isGeneratingAI || pool.status === PoolStatus.FINISHED}
                      className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl border border-white/20 transition-all flex items-center gap-2 group"
                    >
                      <svg className={`w-5 h-5 text-emerald-400 ${isGeneratingAI ? 'animate-spin' : 'group-hover:rotate-12'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                      <span className="text-[10px] font-black uppercase tracking-widest">IA</span>
                    </button>
                 </div>
                 <div className="grid grid-cols-6 gap-2 mt-6">
                   {Array.from({length: 18}).map((_, i) => {
                     const n = selectedNumbers.sort((a,b)=>a-b)[i];
                     return (
                       <div key={i} className={`aspect-square rounded-xl flex items-center justify-center font-black text-xs shadow-inner transition-all ${n ? 'bg-emerald-500 text-white border-emerald-400 border' : 'bg-white/5 border border-white/10 text-white/20'}`}>
                         {n ? n.toString().padStart(2, '0') : '--'}
                       </div>
                     );
                   })}
                 </div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-[40px] shadow-sm border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center mb-6">Escolha exatamente 18 números</p>
              <NumberGrid selected={selectedNumbers} onChange={setSelectedNumbers} disabled={pool.status === PoolStatus.FINISHED} />
            </div>

            {pool.status !== PoolStatus.FINISHED && (
              <button 
                onClick={handleSaveGuess}
                className="w-full bg-emerald-600 text-white font-black py-6 rounded-[28px] shadow-xl hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Confirmar Escolha
              </button>
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-6">
            {pool.draws.map((draw, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 relative">
                <div className="flex justify-between items-center mb-6">
                   <h4 className="font-black text-lg text-gray-800 tracking-tight">Sorteio #{draw.id}</h4>
                   <span className="text-[10px] text-gray-400 font-bold uppercase">{draw.date || 'Pendente'}</span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {draw.numbers.length > 0 ? (
                    draw.numbers.map((n, i) => (
                      <div key={i} className="aspect-square rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-black text-lg shadow-lg">
                        {n.toString().padStart(2, '0')}
                      </div>
                    ))
                  ) : (
                    Array(6).fill(0).map((_, i) => (
                      <div key={i} className="aspect-square rounded-2xl bg-gray-50 border border-gray-100 text-gray-200 flex items-center justify-center font-black">?</div>
                    ))
                  )}
                </div>
                {isUserAdmin && pool.status !== PoolStatus.FINISHED && (
                  <button onClick={() => handleUpdateDraw(idx)} className="w-full mt-8 bg-gray-50 text-gray-400 border border-gray-100 font-black py-4 rounded-2xl text-[10px] hover:bg-emerald-50 hover:text-emerald-600 transition-all uppercase tracking-widest">
                    {draw.numbers.length > 0 ? 'Alterar Resultado' : 'Registrar Resultado'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ranking' && (
          <div className="space-y-4">
            {ranking.length > 0 ? ranking.map((entry, idx) => (
              <div key={idx} className={`p-5 rounded-[32px] flex items-center justify-between shadow-sm ${entry.rank === 1 ? 'bg-amber-50 border border-amber-200' : 'bg-white border border-gray-100'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${entry.rank > 0 ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                    {entry.rank > 0 ? entry.rank + 'º' : '-'}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-800 text-sm">{entry.userName}</h4>
                    <p className="text-[10px] text-gray-400 font-black uppercase mt-0.5">{entry.totalScore} ACERTOS</p>
                  </div>
                </div>
                {entry.prizeValue > 0 && <p className="text-sm font-black text-emerald-600">{formatCurrency(entry.prizeValue)}</p>}
              </div>
            )) : (
              <div className="text-center py-20 opacity-20 italic font-black text-xl">Nenhum palpite</div>
            )}
          </div>
        )}

        {activeTab === 'codes' && isAdmin && (
          <div className="space-y-6">
            <button 
              onClick={handleGenerateCode}
              className="w-full bg-emerald-600 text-white font-black py-5 rounded-3xl shadow-xl flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
              Gerar Novo Código Individual
            </button>

            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Códigos Gerados</h4>
              {poolCodes.map((c, i) => (
                <div key={i} className={`p-5 rounded-[28px] border flex justify-between items-center ${c.used ? 'bg-gray-100 border-gray-200 opacity-60' : 'bg-white border-gray-100 shadow-sm'}`}>
                  <div>
                    <p className="font-black text-lg tracking-widest font-mono text-emerald-700">{c.code}</p>
                    <p className="text-[9px] font-bold uppercase text-gray-400 mt-1">
                      {c.used ? `Usado por: ${c.usedBy?.substring(0,6)}` : 'Disponível'}
                    </p>
                  </div>
                  {!c.used && (
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(c.code);
                        if(notify) notify("Código copiado!");
                      }}
                      className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="space-y-3">
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 mb-6">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Finanças do Grupo</p>
               <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-bold text-gray-400">Prêmio Acumulado</p>
                    <p className="text-2xl font-black text-emerald-600">{formatCurrency(finances.weeklyPrizePool)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-300 uppercase">{pool.participantsIds.length} MEMBROS</p>
                  </div>
               </div>
            </div>
            {pool.participantsIds.map((pid, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs">
                  {idx + 1}
                </div>
                <p className="text-sm font-black text-gray-800">Participante #{pid.substring(0,4).toUpperCase()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showReport && (
        <ReportModal pool={pool} ranking={ranking} finances={finances} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
};

export default PoolDetail;
