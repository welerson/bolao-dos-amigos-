
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pool, Guess, Draw, PoolStatus } from '../types';
import { formatCurrency, calculateFinances, calculateScores, generateRanking, fetchMegaSenaResult } from '../utils';
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

const PoolDetail: React.FC<PoolDetailProps> = ({ pools, setPools, guesses, onSaveGuess, userId, notify }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'participants' | 'guess' | 'results' | 'ranking' | 'finance'>('guess');
  const [showReport, setShowReport] = useState(false);
  
  const pool = pools.find(p => p.id === id);
  const myGuess = guesses.find(g => g.poolId === id && g.userId === userId);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>(myGuess?.numbers || []);

  if (!pool) return <div className="p-8 text-center font-bold">Bolão não encontrado.</div>;

  const finances = calculateFinances(pool.participantsIds.length, pool.price);
  const poolGuesses = guesses.filter(g => g.poolId === id);
  const allScores = calculateScores(poolGuesses, pool.draws);
  const ranking = generateRanking(allScores, [], finances.weeklyPrizePool);

  const handleSaveGuess = () => {
    if (pool.status === PoolStatus.FINISHED) return;
    if (selectedNumbers.length !== 12) {
      alert('Selecione exatamente 12 números!');
      return;
    }
    onSaveGuess({
      id: Math.random().toString(36).substr(2, 9),
      poolId: pool.id,
      userId,
      numbers: selectedNumbers
    });
  };

  const handleUpdateDraw = async (drawIndex: number) => {
    let numbers: number[] | undefined;
    
    const choice = confirm('OK para buscar automático de API confiável, ou CANCELAR para digitar manual.');
    
    if (choice) {
      if (notify) notify("Buscando resultados oficiais...");
      numbers = await fetchMegaSenaResult();
    } else {
      const input = prompt('Insira os 6 números do sorteio separados por vírgula (ex: 4, 12, 25, 33, 41, 58)');
      numbers = input?.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n >= 1 && n <= 60);
    }

    if (!numbers || numbers.length !== 6) {
      alert('Resultado inválido. Certifique-se de inserir exatamente 6 números entre 1 e 60.');
      return;
    }

    setPools(prev => prev.map(p => {
      if (p.id === id) {
        const newDraws = [...p.draws];
        newDraws[drawIndex] = { 
          ...newDraws[drawIndex], 
          numbers: numbers!, 
          date: new Date().toLocaleDateString('pt-BR') 
        };
        
        const filledDraws = newDraws.filter(d => d.numbers.length === 6).length;
        let newStatus = p.status;
        
        if (filledDraws === 3) {
          newStatus = PoolStatus.FINISHED;
          if (notify) notify("Semana encerrada! Ranking final disponível.");
        } else {
          newStatus = PoolStatus.IN_PROGRESS;
          if (notify) notify(`Resultado do sorteio ${drawIndex + 1} lançado!`);
        }

        return { ...p, draws: newDraws, status: newStatus };
      }
      return p;
    }));
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
          <button 
            onClick={() => setShowReport(true)}
            className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg hover:shadow-emerald-200 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </button>
        )}
      </header>

      <div className="flex bg-white overflow-x-auto no-scrollbar border-b border-gray-100 shadow-sm z-10">
        {[
          { id: 'guess', label: 'Meu Palpite' },
          { id: 'results', label: 'Resultados' },
          { id: 'ranking', label: 'Ranking' },
          { id: 'finance', label: 'Financeiro' },
          { id: 'participants', label: 'Participantes' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-4 text-[11px] font-black uppercase tracking-tight whitespace-nowrap border-b-[3px] transition-all ${
              activeTab === tab.id ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-28 no-scrollbar space-y-6">
        {activeTab === 'participants' && (
          <div className="space-y-4">
             <div className="bg-emerald-600 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="text-xl font-black mb-1">Membros</h4>
                  <p className="text-xs text-emerald-100 opacity-80 uppercase font-bold tracking-widest">Ativos no Bolão</p>
                  <p className="mt-4 text-3xl font-black">{pool.participantsIds.length} <span className="text-lg opacity-60">/ {pool.capacity}</span></p>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
             </div>
             <div className="grid gap-3">
               {pool.participantsIds.map((pid, idx) => (
                 <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-3xl shadow-sm border border-gray-100">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${pid}-${idx}`} className="w-12 h-12 rounded-2xl bg-gray-50 p-1" alt="Avatar" />
                    <div>
                      <p className="text-sm font-black text-gray-800">Participante #{idx + 1}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Registrado em Maio/24</p>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {activeTab === 'guess' && (
          <div className="space-y-6">
            <div className="bg-emerald-900 text-white p-8 rounded-[48px] shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-2xl font-black leading-tight mb-2">Seus<br/>Números</h3>
                 <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-6">Sua sorte em 12 dezenas</p>
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
               <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl"></div>
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
              <div key={idx} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-black text-lg text-gray-800 tracking-tight">Sorteio Oficial #{draw.id}</h4>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{draw.date || 'Sorteio Pendente'}</p>
                  </div>
                  {draw.numbers.length > 0 ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 animate-pulse">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                    </div>
                  )}
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
                      <div key={i} className="aspect-square rounded-2xl bg-gray-50 border border-gray-100 text-gray-300 flex items-center justify-center font-black">
                        ?
                      </div>
                    ))
                  )}
                </div>

                {pool.adminId === userId && pool.status !== PoolStatus.FINISHED && draw.numbers.length === 0 && (
                  <button 
                    onClick={() => handleUpdateDraw(idx)}
                    className="w-full mt-8 bg-gray-50 text-gray-500 border border-gray-100 font-black py-4 rounded-2xl text-xs hover:bg-emerald-50 hover:text-emerald-700 transition-all uppercase tracking-widest"
                  >
                    Lançar Resultado
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ranking' && (
          <div className="space-y-4">
            {ranking.length === 0 ? (
              <div className="p-12 text-center text-gray-400 font-bold bg-white rounded-[40px] shadow-inner">Nenhum palpite enviado.</div>
            ) : (
              ranking.map((entry, idx) => (
                <div key={idx} className={`p-5 rounded-[32px] flex items-center justify-between transition-all shadow-sm ${
                  entry.rank === 1 ? 'bg-amber-50 border border-amber-200' :
                  entry.rank === 2 ? 'bg-slate-50 border border-slate-200' :
                  entry.rank === 3 ? 'bg-orange-50 border border-orange-200' : 'bg-white border border-gray-100'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center font-black text-sm shadow-md ${
                      entry.rank === 1 ? 'bg-amber-400 text-white' :
                      entry.rank === 2 ? 'bg-slate-300 text-white' :
                      entry.rank === 3 ? 'bg-orange-300 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {entry.rank > 0 ? entry.rank + 'º' : '-'}
                    </div>
                    <div>
                      <h4 className="font-black text-gray-800 text-sm">{entry.userName}</h4>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{entry.totalScore} Pontos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {entry.prizeValue > 0 ? (
                      <p className="text-sm font-black text-emerald-600">{formatCurrency(entry.prizeValue)}</p>
                    ) : (
                      <p className="text-[10px] text-gray-300 font-bold uppercase">Sem prêmio</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div className="bg-gray-900 text-white p-8 rounded-[48px] shadow-2xl relative overflow-hidden">
               <h3 className="text-2xl font-black mb-8">Balanço do Bolão</h3>
               <div className="space-y-5">
                 <div className="flex justify-between items-center text-sm border-b border-white/10 pb-4">
                   <span className="opacity-50 font-bold uppercase tracking-widest">Arrecadado</span>
                   <span className="font-black text-xl">{formatCurrency(finances.totalCollected)}</span>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                        <p className="text-[9px] font-black text-emerald-400 uppercase mb-1 tracking-widest">Taxa Adm (30%)</p>
                        <p className="text-sm font-black">{formatCurrency(finances.adminFee)}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                        <p className="text-[9px] font-black text-emerald-400 uppercase mb-1 tracking-widest">Reserva (10%)</p>
                        <p className="text-sm font-black">{formatCurrency(finances.reserveFee)}</p>
                    </div>
                 </div>
                 <div className="bg-emerald-500 p-6 rounded-[32px] flex justify-between items-center mt-4 shadow-xl shadow-emerald-500/20">
                   <span className="font-black text-emerald-900 uppercase text-xs tracking-widest">Prêmio Semanal</span>
                   <span className="text-2xl font-black text-white">{formatCurrency(finances.weeklyPrizePool)}</span>
                 </div>
               </div>
            </div>

            <div className="space-y-4">
               <h4 className="font-black text-gray-800 ml-4 tracking-tight">Divisão de Prêmios</h4>
               {[
                 { label: '1º Lugar', percent: '75%', val: finances.tier1Pool, winners: ranking.filter(r=>r.rank===1).length, color: 'border-amber-400 bg-amber-50/30' },
                 { label: '2º Lugar', percent: '15%', val: finances.tier2Pool, winners: ranking.filter(r=>r.rank===2).length, color: 'border-slate-300 bg-slate-50/30' },
                 { label: '3º Lugar', percent: '10%', val: finances.tier3Pool, winners: ranking.filter(r=>r.rank===3).length, color: 'border-orange-300 bg-orange-50/30' },
               ].map((item, i) => (
                 <div key={i} className={`p-6 rounded-[32px] shadow-sm border-l-[6px] ${item.color} ${item.color.split(' ')[0]} flex justify-between items-center`}>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label} ({item.percent})</span>
                      <p className="text-xl font-black text-gray-800">{formatCurrency(item.val)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] bg-white text-emerald-600 px-3 py-1.5 rounded-full font-black shadow-sm border border-emerald-100">{item.winners} GANH.</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>

      {showReport && (
        <ReportModal 
          pool={pool} 
          ranking={ranking} 
          finances={finances} 
          onClose={() => setShowReport(false)} 
        />
      )}
    </div>
  );
};

export default PoolDetail;
