
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Pool, Guess, Draw, PoolStatus } from '../types';
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
}

const PoolDetail: React.FC<PoolDetailProps> = ({ pools, guesses, onSaveGuess, userId, notify }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'participants' | 'guess' | 'results' | 'ranking' | 'finance'>('guess');
  const [showReport, setShowReport] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  const pool = pools.find(p => p.id === id);
  const myGuess = guesses.find(g => g.poolId === id && g.userId === userId);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>(myGuess?.numbers || []);

  useEffect(() => {
    if (myGuess) setSelectedNumbers(myGuess.numbers);
  }, [myGuess]);

  if (!pool) return <div className="p-8 text-center font-bold">Carregando bolão...</div>;

  const finances = calculateFinances(pool.participantsIds.length, pool.price);
  const poolGuesses = guesses.filter(g => g.poolId === id);
  const allScores = calculateScores(poolGuesses, pool.draws);
  const ranking = generateRanking(allScores, [], finances.weeklyPrizePool);

  const handleAIGuess = async () => {
    setIsGeneratingAI(true);
    if (notify) notify("O Gemini está analisando as dezenas...");
    const aiNumbers = await generateAIGuess();
    setSelectedNumbers(aiNumbers);
    setIsGeneratingAI(false);
    if (notify) notify("Palpite inteligente gerado!");
  };

  const handleSaveGuess = () => {
    if (pool.status === PoolStatus.FINISHED) return;
    if (selectedNumbers.length !== 12) {
      alert('Selecione exatamente 12 números!');
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
    let numbers: number[] | undefined;
    const choice = confirm('OK para buscar automático, ou CANCELAR para manual.');
    
    if (choice) {
      if (notify) notify("Buscando resultados oficiais...");
      numbers = await fetchMegaSenaResult();
    } else {
      const input = prompt('Insira os 6 números (ex: 4, 12, 25, 33, 41, 58)');
      numbers = input?.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    }

    if (!numbers || numbers.length !== 6) {
      alert('Resultado inválido.');
      return;
    }

    try {
      const poolRef = doc(db, 'pools', pool.id);
      const newDraws = [...pool.draws];
      newDraws[drawIndex] = { 
        ...newDraws[drawIndex], 
        numbers: numbers!, 
        date: new Date().toLocaleDateString('pt-BR') 
      };
      
      const filledCount = newDraws.filter(d => d.numbers.length === 6).length;
      let newStatus = pool.status;
      if (filledCount === 3) newStatus = PoolStatus.FINISHED;
      else if (filledCount > 0) newStatus = PoolStatus.IN_PROGRESS;

      await updateDoc(poolRef, { draws: newDraws, status: newStatus });
      if (notify) notify("Resultado atualizado para todos!");
    } catch (e) {
      if (notify) notify("Erro ao atualizar sorteio.");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-screen overflow-hidden">
      <header className="p-4 bg-white flex items-center justify-between border-b border-gray-100 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="p-2 hover:bg-gray-100 rounded-2xl transition-all active:scale-90">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h2 className="font-black text-gray-800 leading-none">{pool.name}</h2>
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
        {['Palpite', 'Resultados', 'Ranking', 'Financeiro', 'Participantes'].map((label, idx) => {
          const ids = ['guess', 'results', 'ranking', 'finance', 'participants'];
          return (
            <button key={ids[idx]} onClick={() => setActiveTab(ids[idx] as any)} className={`px-5 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap border-b-[3px] transition-all ${activeTab === ids[idx] ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400'}`}>
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-28 no-scrollbar space-y-6">
        {activeTab === 'guess' && (
          <div className="space-y-6">
            <div className="bg-emerald-900 text-white p-8 rounded-[48px] shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                 <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-black leading-tight mb-2">Seus<br/>Números</h3>
                    <button 
                      onClick={handleAIGuess}
                      disabled={isGeneratingAI || pool.status === PoolStatus.FINISHED}
                      className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl border border-white/20 transition-all flex items-center gap-2 group"
                    >
                      <svg className={`w-5 h-5 text-emerald-400 ${isGeneratingAI ? 'animate-spin' : 'group-hover:rotate-12'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                      <span className="text-[10px] font-black uppercase tracking-widest">Palpite IA</span>
                    </button>
                 </div>
                 <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mt-4 mb-6">Sua sorte em 12 dezenas</p>
                 <div className="grid grid-cols-4 gap-3">
                   {Array.from({length: 12}).map((_, i) => {
                     const n = selectedNumbers.sort((a,b)=>a-b)[i];
                     return (
                       <div key={i} className={`aspect-square rounded-2xl flex items-center justify-center font-black text-lg shadow-inner transition-all ${n ? 'bg-emerald-500 text-white border-emerald-400 border' : 'bg-white/5 border border-white/10 text-white/20'}`}>
                         {n ? n.toString().padStart(2, '0') : '--'}
                       </div>
                     );
                   })}
                 </div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-[40px] shadow-sm border border-gray-100">
              <NumberGrid selected={selectedNumbers} onChange={setSelectedNumbers} disabled={pool.status === PoolStatus.FINISHED} />
            </div>

            {pool.status !== PoolStatus.FINISHED && (
              <button 
                onClick={handleSaveGuess}
                className="w-full bg-emerald-600 text-white font-black py-6 rounded-[28px] shadow-xl hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                Confirmar Palpite
              </button>
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-6">
            {pool.draws.map((draw, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 relative">
                <div className="flex justify-between items-center mb-6">
                   <h4 className="font-black text-lg text-gray-800 tracking-tight">Concurso #{draw.id}</h4>
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
                {pool.adminId === userId && pool.status !== PoolStatus.FINISHED && draw.numbers.length === 0 && (
                  <button onClick={() => handleUpdateDraw(idx)} className="w-full mt-8 bg-gray-50 text-gray-400 border border-gray-100 font-black py-4 rounded-2xl text-[10px] hover:bg-emerald-50 hover:text-emerald-600 transition-all uppercase tracking-widest">Registrar Resultado</button>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ranking' && (
          <div className="space-y-4">
            {ranking.map((entry, idx) => (
              <div key={idx} className={`p-5 rounded-[32px] flex items-center justify-between transition-all shadow-sm ${entry.rank === 1 ? 'bg-amber-50 border border-amber-200' : 'bg-white border border-gray-100'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${entry.rank > 0 ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {entry.rank > 0 ? entry.rank + 'º' : '-'}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-800 text-sm">{entry.userName}</h4>
                    <p className="text-[10px] text-gray-400 font-black uppercase mt-0.5">{entry.totalScore} Pontos</p>
                  </div>
                </div>
                <div className="text-right">
                  {entry.prizeValue > 0 && <p className="text-sm font-black text-emerald-600">{formatCurrency(entry.prizeValue)}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div className="bg-gray-900 text-white p-8 rounded-[48px] shadow-2xl relative overflow-hidden">
               <h3 className="text-2xl font-black mb-8">Balanço Semanal</h3>
               <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm border-b border-white/10 pb-4 opacity-70">
                   <span className="font-bold uppercase tracking-widest">Total Arrecadado</span>
                   <span className="font-black text-xl">{formatCurrency(finances.totalCollected)}</span>
                 </div>
                 <div className="bg-emerald-500 p-6 rounded-[32px] flex justify-between items-center mt-4">
                   <span className="font-black text-emerald-900 uppercase text-[10px] tracking-widest">Pool de Prêmios</span>
                   <span className="text-2xl font-black text-white">{formatCurrency(finances.weeklyPrizePool)}</span>
                 </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="space-y-3">
            {pool.participantsIds.map((pid, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-3xl shadow-sm border border-gray-100">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${pid}`} className="w-12 h-12 rounded-2xl bg-gray-50" alt="Avatar" />
                <div>
                  <p className="text-sm font-black text-gray-800">Participante #{idx + 1}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sincronizado</p>
                </div>
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
