
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pool, PoolStatus } from '../types';
import { formatCurrency } from '../utils';

interface PoolListProps {
  pools: Pool[];
  onJoin: (id: string, code: string) => void;
  userId?: string;
}

const PoolList: React.FC<PoolListProps> = ({ pools, onJoin, userId }) => {
  const navigate = useNavigate();
  const [joiningPoolId, setJoiningPoolId] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState('');

  const handleJoinClick = (poolId: string) => {
    setJoiningPoolId(poolId);
  };

  const confirmJoin = () => {
    if (!accessCode.trim()) {
      alert("Por favor, insira o código individual enviado pelo admin.");
      return;
    }
    if (joiningPoolId) {
      onJoin(joiningPoolId, accessCode.trim().toUpperCase());
      setJoiningPoolId(null);
      setAccessCode('');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-gray-50/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/home')} className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-xl font-bold">Explorar Grupos</h2>
        </div>
      </header>

      <div className="p-6 space-y-4">
        {pools.map(pool => {
          const isFull = pool.participantsIds.length >= pool.capacity;
          const isMember = userId && pool.participantsIds.includes(userId);
          const progress = (pool.participantsIds.length / pool.capacity) * 100;

          return (
            <div key={pool.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 relative overflow-hidden">
              {pool.status === PoolStatus.FINISHED && (
                <div className="absolute top-0 right-0 bg-gray-200 text-gray-600 px-3 py-1 rounded-bl-xl text-[8px] font-black uppercase">Finalizado</div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-2 inline-block ${
                    pool.status === PoolStatus.AWAITING ? 'bg-amber-100 text-amber-700' : 
                    pool.status === PoolStatus.IN_PROGRESS ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {pool.status}
                  </span>
                  <h3 className="text-lg font-bold text-gray-800">{pool.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-medium">Inscrição</p>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(pool.price)}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-gray-500">Ocupação (Cotas)</span>
                  <span className="text-gray-800">{pool.participantsIds.length} / {pool.capacity}</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2">
                  {isMember && (
                    <button 
                        onClick={() => navigate(`/pool/${pool.id}`)}
                        className="flex-1 bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
                    >
                        Acessar Grupo
                    </button>
                  )}
                  <button 
                    disabled={isFull || pool.status === PoolStatus.FINISHED}
                    onClick={() => handleJoinClick(pool.id)}
                    className={`flex-1 font-black py-4 rounded-2xl shadow-sm transition-all ${
                        isFull ? 'bg-gray-100 text-gray-400 cursor-not-allowed hidden' : 
                        isMember ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] uppercase tracking-wider' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {isMember ? '+ Comprar Cota' : 'Entrar com Código'}
                  </button>
              </div>
            </div>
          );
        })}
      </div>

      {joiningPoolId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-emerald-950/80 backdrop-blur-sm">
          <div className="bg-white w-full rounded-[40px] p-8 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-2xl font-black text-gray-800 mb-2">Validar Nova Cota</h3>
            <p className="text-gray-400 text-sm mb-6">Insira o código individual que você recebeu para registrar este novo jogo no grupo.</p>
            
            <input 
              autoFocus
              type="text"
              placeholder="CÓDIGO INDIVIDUAL"
              className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-3xl text-center font-black text-xl tracking-[0.3em] uppercase focus:border-emerald-500 focus:bg-white outline-none mb-6 transition-all"
              value={accessCode}
              onChange={e => setAccessCode(e.target.value)}
            />

            <div className="flex gap-3">
              <button 
                onClick={() => { setJoiningPoolId(null); setAccessCode(''); }}
                className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmJoin}
                className="flex-[2] bg-emerald-600 text-white font-black py-4 rounded-[24px] shadow-xl hover:bg-emerald-700 active:scale-95 transition-all"
              >
                Validar Cota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoolList;
