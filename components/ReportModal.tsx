
import React from 'react';
import { Pool, RankingEntry } from '../types';
import { formatCurrency } from '../utils';

interface ReportModalProps {
  pool: Pool;
  ranking: RankingEntry[];
  finances: any;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ pool, ranking, finances, onClose }) => {
  const topWinners = ranking.filter(r => r.rank > 0);

  const handleShare = async () => {
    const winnersText = topWinners.length > 0 
      ? topWinners.map(w => `${w.rank}º: ${w.userName} (${w.totalScore} pts) - ${formatCurrency(w.prizeValue)}`).join('\n')
      : "Nenhum vencedor nesta rodada.";

    const text = `🏆 BOLÃO DOS AMIGOS: ${pool.name}\n\n💰 Arrecadado: ${formatCurrency(finances.totalCollected)}\n💎 Prêmio Semanal: ${formatCurrency(finances.weeklyPrizePool)}\n\n✨ VENCEDORES:\n${winnersText}\n\nOrganize o seu também no Bolão dos Amigos!`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Resumo do Bolão', text });
      } catch (e) {
        console.error("Erro ao compartilhar", e);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Resumo copiado para a área de transferência!');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="bg-emerald-600 p-8 text-white flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-black leading-tight">Resumo do<br/>Bolão</h3>
            <p className="text-emerald-100 text-sm mt-1 opacity-80">{pool.name}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          <section>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Números Sorteados</h4>
            <div className="space-y-4">
              {pool.draws.map((d, i) => (
                <div key={i} className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl">
                  <span className="text-[10px] font-black text-emerald-600 w-8">C{d.id}</span>
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                    {d.numbers.map((n, ni) => (
                      <span key={ni} className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 shadow-sm">{n}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Distribuição Financeira</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 p-4 rounded-3xl">
                <p className="text-[9px] font-bold text-emerald-600 uppercase mb-1">Total</p>
                <p className="text-sm font-black">{formatCurrency(finances.totalCollected)}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-3xl">
                <p className="text-[9px] font-bold text-blue-600 uppercase mb-1">Prêmios</p>
                <p className="text-sm font-black">{formatCurrency(finances.weeklyPrizePool)}</p>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Ganhadores</h4>
            <div className="space-y-2">
              {topWinners.length > 0 ? topWinners.map((w, i) => (
                <div key={i} className={`flex justify-between items-center p-4 rounded-3xl border ${w.rank === 1 ? 'border-amber-200 bg-amber-50/50' : 'border-gray-100 bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${w.rank === 1 ? 'bg-amber-400 text-white' : w.rank === 2 ? 'bg-slate-300 text-white' : 'bg-orange-300 text-white'}`}>{w.rank}º</span>
                    <div>
                      <p className="text-xs font-black text-gray-800">{w.userName}</p>
                      <p className="text-[9px] text-gray-400 font-bold">{w.totalScore} pontos</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-600">{formatCurrency(w.prizeValue)}</span>
                </div>
              )) : (
                <p className="text-center text-xs text-gray-400 italic py-4">Aguardando resultados finais...</p>
              )}
            </div>
          </section>
        </div>

        <div className="p-8 border-t border-gray-100 bg-gray-50">
          <button 
            onClick={handleShare}
            className="w-full bg-emerald-600 text-white font-black py-5 rounded-[24px] shadow-xl hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/></svg>
            Enviar Relatório
          </button>
        </div>
      </div>
    </div>
  );
};
