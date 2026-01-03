
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
}

const PoolDetail: React.FC<PoolDetailProps> = ({ pools, setPools, guesses, onSaveGuess, userId }) => {
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
    alert('Palpite salvo com sucesso!');
  };

  const handleUpdateDraw = async (drawIndex: number, manualNumbers?: number[]) => {
    let numbers = manualNumbers;
    if (!numbers) {
      if (confirm('Deseja buscar o resultado oficial automaticamente?')) {
        numbers = await fetchMegaSenaResult();
      } else {
        const input = prompt('Insira 6 números separados por vírgula (ex: 4,12,25,33,41,58)');
        numbers = input?.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
      }
    }

    if (!numbers || numbers.length !== 6) {
      alert('Resultado inválido. Insira 6 números.');
      return;
    }

    setPools(prev => prev.map(p => {
      if (p.id === id) {
        const newDraws = [...p.draws];
        newDraws[drawIndex] = { ...newDraws[drawIndex], numbers: numbers!, date: new Date().toLocaleDateString('pt-BR') };
        
        // Check if all 3 draws are filled
        const allFilled = newDraws.every(d => d.numbers.length === 6);
        let newStatus = p.status;
        if (allFilled) newStatus = PoolStatus.FINISHED;
        else if (newDraws.some(d => d.numbers.length > 0)) newStatus = PoolStatus.IN_PROGRESS;

        return { ...p, draws: newDraws, status: newStatus };
      }
      return p;
    }));
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-screen overflow-hidden">
      <header className="p-4 bg-white flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h2 className="font-bold text-gray-800 leading-none">{pool.name}</h2>
            <span className={`text-[10px] font-bold uppercase ${pool.status === PoolStatus.FINISHED ? 'text-blue-600' : 'text-emerald-500'}`}>{pool.status}</span>
          </div>
        </div>
        {pool.status === PoolStatus.FINISHED && (
          <button 
            onClick={() => setShowReport(true)}
            className="p-2 bg-emerald-50 text-emerald-600 rounded-xl shadow-sm hover:bg-emerald-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
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
            className={`px-5 py-4 text-xs font-bold whitespace-nowrap border-b-4 transition-all ${
              activeTab === tab.id ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 no-scrollbar">
        {activeTab === 'participants' && (
          <div className="space-y-3">
             <div className="bg-emerald-50 p-6 rounded-[32px] flex justify-between items-center mb-6">
                <div>
                  <h4 className="text-emerald-800 font-bold">Participantes</h4>
                  <p className="text-xs text-emerald-600">Total ativo no bolão</p>
                </div>
                <span className="bg-emerald-600 text-white px-4 py-2 rounded-2xl text-sm font-bold shadow-lg">{pool.participantsIds.length} / {pool.capacity}</span>
             </div>
             {pool.participantsIds.map((pid, idx) => (
               <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-3xl shadow-sm border border-gray-100 transition-transform active:scale-[0.98]">
                  <img src={`https://picsum.photos/seed/${pid}-${idx}/48/48`} className="w-12 h-12 rounded-2xl" alt="Avatar" />
                  <div>
                    <p className="text-sm font-bold text-gray-800">Participante #{idx + 1}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Membro desde Maio/24</p>
                  </div>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'guess' && (
          <div className="space-y-6">
            <div className="bg-emerald-700 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-xl font-bold mb-1">Seu Bilhete da Sorte</h3>
                 <p className="text-xs text-emerald-100 opacity-80 mb-6">Você deve selecionar exatamente 12 números.</p>
                 <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                   {Array.from({length: 12}).map((_, i) => {
                     const n = selectedNumbers.sort((a,b)=>a-b)[i];
                     return (
                       <div key={i} className="aspect-square bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center font-bold text-sm shadow-inner">
                         {n ? n.toString().padStart(2, '0') : '--'}
                       </div>
                     );
                   })}
                 </div>
               </div>
               <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            <div className="bg-white p-6 rounded-[40px] shadow-sm border border-gray-100">
              <NumberGrid selected={selectedNumbers} onChange={setSelectedNumbers} disabled={pool.status === PoolStatus.FINISHED} />
            </div>

            {pool.status !== PoolStatus.FINISHED && (
              <button 
                onClick={handleSaveGuess}
                className="w-full bg-emerald-600 text-white font-bold py-6 rounded-3xl shadow-xl hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                Confirmar Palpite
              </button>
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-6">
            {pool.draws.map((draw, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 relative">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-bold text-lg text-gray-800">Concurso {idx + 1}</h4>
                    <p className="text-xs text-gray-400 font-medium">{draw.date || 'Aguardando sorteio oficial...'}</p>
                  </div>
                  {draw.numbers.length > 0 ? (
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">Processado</span>
                  ) : (
                    <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">Pendente</span>
                  )}
                </div>
                
                <div className="grid grid-cols-6 gap-2">
                  {draw.numbers.length > 0 ? (
                    draw.numbers.map((n, i) => (
                      <div key={i} className="aspect-square rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-bold shadow-lg transform hover:scale-105 transition-transform">
                        {n.toString().padStart(2, '0')}
                      </div>
                    ))
                  ) : (
                    Array(6).fill(0).map((_, i) => (
                      <div key={i} className="aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 text-gray-300 flex items-center justify-center font-bold">
                        ?
                      </div>
                    ))
                  )}
                </div>

                {pool.adminId === userId && pool.status !== PoolStatus.FINISHED && draw.numbers.length === 0 && (
                  <button 
                    onClick={() => handleUpdateDraw(idx)}
                    className="w-full mt-8 bg-gray-50 text-gray-600 border border-gray-200 font-bold py-4 rounded-2xl text-xs hover:bg-gray-100 transition-colors"
                  >
                    Registrar Resultado
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ranking' && (
          <div className="space-y-4">
            {ranking.length === 0 ? (
              <div className="p-12 text-center text-gray-400 font-medium italic">Nenhum palpite enviado nesta rodada.</div>
            ) : (
              ranking.map((entry, idx) => (
                <div key={idx} className={`p-5 rounded-[32px] flex items-center justify-between transition-all ${
                  entry.rank === 1 ? 'bg-amber-50 border border-amber-200 shadow-amber-100 shadow-md' :
                  entry.rank === 2 ? 'bg-slate-50 border border-slate-200' :
                  entry.rank === 3 ? 'bg-orange-50 border border-orange-200' : 'bg-white border border-gray-100'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm ${
                      entry.rank === 1 ? 'bg-amber-400 text-white' :
                      entry.rank === 2 ? 'bg-slate-300 text-white' :
                      entry.rank === 3 ? 'bg-orange-300 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {entry.rank > 0 ? entry.rank + 'º' : '-'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{entry.userName}</h4>
                      <div className="flex gap-1 mt-0.5">
                        {entry.drawScores.map((ds, i) => (
                          <span key={i} className="text-[10px] bg-gray-200/50 text-gray-500 px-1.5 rounded font-bold">C{i+1}: {ds}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">{entry.totalScore} <span className="text-[10px] text-gray-400">pts</span></p>
                    {entry.prizeValue > 0 && <p className="text-[10px] font-bold text-emerald-600">+{formatCurrency(entry.prizeValue)}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div className="bg-gray-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
               <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                 <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 Balanço do Bolão
               </h3>
               <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm border-b border-white/10 pb-4">
                   <span className="opacity-60 font-medium">Arrecadação Total</span>
                   <span className="font-bold text-lg">{formatCurrency(finances.totalCollected)}</span>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                        <p className="text-[10px] font-bold text-emerald-400 uppercase mb-1">Taxa Adm (30%)</p>
                        <p className="text-sm font-bold">{formatCurrency(finances.adminFee)}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                        <p className="text-[10px] font-bold text-emerald-400 uppercase mb-1">Reserva (10%)</p>
                        <p className="text-sm font-bold">{formatCurrency(finances.reserveFee)}</p>
                    </div>
                 </div>
                 <div className="bg-emerald-500/10 p-5 rounded-[32px] flex justify-between items-center mt-2 border border-emerald-500/20">
                   <span className="font-bold text-emerald-200">Prêmio Semanal</span>
                   <span className="text-2xl font-black text-emerald-400">{formatCurrency(finances.weeklyPrizePool)}</span>
                 </div>
               </div>
            </div>

            <div className="space-y-4">
               <h4 className="font-bold text-gray-800 ml-4">Prêmios por Faixa</h4>
               {[
                 { label: '1º Lugar', percent: '75%', val: finances.tier1Pool, winners: ranking.filter(r=>r.rank===1).length, color: 'border-amber-400' },
                 { label: '2º Lugar', percent: '15%', val: finances.tier2Pool, winners: ranking.filter(r=>r.rank===2).length, color: 'border-slate-300' },
                 { label: '3º Lugar', percent: '10%', val: finances.tier3Pool, winners: ranking.filter(r=>r.rank===3).length, color: 'border-orange-300' },
               ].map((item, i) => (
                 <div key={i} className={`bg-white p-6 rounded-[32px] shadow-sm border-l-8 ${item.color} flex justify-between items-center`}>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{item.label} ({item.percent})</span>
                      <p className="text-xl font-black text-gray-800">{formatCurrency(item.val)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full font-black uppercase tracking-wider">{item.winners} GANH.</span>
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
