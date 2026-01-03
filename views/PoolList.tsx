
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pool, PoolStatus } from '../types';
import { formatCurrency } from '../utils';

interface PoolListProps {
  pools: Pool[];
  onJoin: (id: string) => void;
  userId?: string;
}

const PoolList: React.FC<PoolListProps> = ({ pools, onJoin, userId }) => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-gray-50 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/home')} className="p-2 bg-white rounded-xl shadow-sm">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-xl font-bold">Bolões Disponíveis</h2>
        </div>
      </header>

      <div className="p-6 space-y-4">
        {pools.map(pool => {
          const isFull = pool.participantsIds.length >= pool.capacity;
          const isMember = userId && pool.participantsIds.includes(userId);
          const progress = (pool.participantsIds.length / pool.capacity) * 100;

          return (
            <div key={pool.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md mb-2 inline-block ${
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
                  <span className="text-gray-500">Capacidade</span>
                  <span className="text-gray-800">{pool.participantsIds.length} / {pool.capacity} vagas</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {isMember ? (
                <button 
                  onClick={() => navigate(`/pool/${pool.id}`)}
                  className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-2xl shadow-md"
                >
                  Ver Meu Bolão
                </button>
              ) : (
                <button 
                  disabled={isFull}
                  onClick={() => onJoin(pool.id)}
                  className={`w-full font-bold py-3.5 rounded-2xl shadow-sm transition-all ${
                    isFull ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {isFull ? 'Bolão Lotado' : 'Participar'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PoolList;
