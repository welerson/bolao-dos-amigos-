
import React from 'react';
import { Pool, RankingEntry, FinancialReport } from '../types';
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
    const text = `🏆 Bolão: ${pool.name}\n💰 Total: ${formatCurrency(finances.totalCollected)}\n💎 1º Lugar: ${formatCurrency(finances.tier1Pool)}\n\nConfira o ranking completo no app!`;
    if (navigator.share) {
      await navigator.share({ title: 'Resumo do Bolão', text });
    } else {
      alert('Compartilhamento não suportado neste navegador. Dados copiados para área de transferência.');
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-emerald-600 p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Relatório Semanal</h3>
            <p className="text-emerald-100 text-xs">{pool.name}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/20 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          <section>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Resumo Financeiro</h4>
            <div className="bg-gray-50 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Arrecadado:</span> <span className="font-bold">{formatCurrency(finances.totalCollected)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Prêmio Semanal:</span> <span className="font-bold text-emerald-600">{formatCurrency(finances.weeklyPrizePool)}</span></div>
              <div className="flex justify-between text-xs text-gray-400"><span>Adm/Reserva:</span> <span>{formatCurrency(finances.adminFee + finances.reserveFee)}</span></div>
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Sorteios da Semana</h4>
            <div className="space-y-3">
              {pool.draws.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-8">#{d.id}</span>
                  <div className="flex gap-1">
                    {d.numbers.map((n, ni) => (
                      <span key={ni} className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">{n}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Vencedores</h4>
            <div className="space-y-2">
              {topWinners.map((w, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${w.rank === 1 ? 'bg-amber-400 text-white' : w.rank === 2 ? 'bg-gray-300 text-white' : 'bg-orange-300 text-white'}`}>{w.rank}º</span>
                    <span className="text-xs font-bold">{w.userName}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">{formatCurrency(w.prizeValue)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <button 
            onClick={handleShare}
            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 12.684a3 3 0 100-2.684 3 3 0 000 2.684z" /></svg>
            Compartilhar Resumo
          </button>
        </div>
      </div>
    </div>
  );
};
