
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Pool, PoolStatus } from '../types';
import { formatCurrency } from '../utils';

interface PoolListProps {
  pools: Pool[];
  onJoin: (id: string, code: string) => void;
  userId?: string;
  isAdmin?: boolean;
  onNotify?: (msg: string) => void;
}

const PoolList: React.FC<PoolListProps> = ({ pools, onJoin, userId, isAdmin, onNotify }) => {
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

  const handleDelete = async (e: React.MouseEvent, poolId: string) => {
    e.stopPropagation();
    if (!window.confirm("Você tem certeza que deseja excluir este bolão? Todos os dados vinculados serão perdidos.")) return;
    
    try {
      await deleteDoc(doc(db, 'pools', poolId));
      if (onNotify) onNotify("Bolão removido com sucesso!");
    } catch (err) {
      console.error(err);
      if (onNotify) onNotify("Erro ao excluir bolão.");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-gray-50/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/home')} className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-all active:scale-95">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Explorar Grupos</h2>
        </div>
      </header>

      <div className="p-6 space-y-5">
        {pools.length === 0 ? (
          <div className="text-center py-20">
             <div className="w-20 h-20 bg-gray-100 rounded-[32px] flex items-center justify-center mx-auto mb-4 text-gray-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
             </div>
             <p className="text-gray-400 font-bold text-sm">Nenhum bolão disponível no momento.</p>
          </div>
        ) : pools.map(pool => {
          const isFull = pool.participantsIds.length >= pool.capacity;
          const isMember = userId && pool.participantsIds.includes(userId);
          const isPoolAdmin = userId === pool.adminId || isAdmin;
          const progress = (pool.participantsIds.length / pool.capacity) * 100;

          return (
            <div key={pool.id} className="bg-white rounded-[40px] p-7 shadow-sm border border-gray-100 relative overflow-hidden group transition-all hover:shadow-md">
              {/* Botão de Excluir para Admins */}
              {isPoolAdmin && (
                <button 
                  onClick={(e) => handleDelete(e, pool.id)}
                  className="absolute top-5 right-5 p-2 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              )}

              {pool.status === PoolStatus.FINISHED && (
                <div className="absolute top-0 right-0 bg-gray-200 text-gray-600 px-4 py-1 rounded-bl-2xl text-[8px] font-black uppercase tracking-widest">Finalizado</div>
              )}
              
              <div className="flex justify-between items-start mb-6 pr-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      pool.status === PoolStatus.AWAITING ? 'bg-amber-100 text-amber-700' : 
                      pool.status === PoolStatus.IN_PROGRESS ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {pool.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-gray-800 leading-tight">{pool.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Inscrição</p>
                  <p className="text-xl font-black text-emerald-600">{formatCurrency(pool.price)}</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 text-gray-400">
                  <span>Ocupação (Cotas)</span>
                  <span className="text-gray-800">{pool.participantsIds.length} / {pool.capacity}</span>
                </div>
                <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden border border-gray-100">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out ${isFull ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-3">
                  {isMember && (
                    <button 
                        onClick={() => navigate(`/pool/${pool.id}`)}
                        className="flex-1 bg-emerald-600 text-white font-black py-5 rounded-3xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Acessar Grupo
                    </button>
                  )}
                  <button 
                    disabled={isFull || pool.status === PoolStatus.FINISHED}
                    onClick={() => handleJoinClick(pool.id)}
                    className={`flex-1 font-black py-5 rounded-3xl transition-all flex items-center justify-center gap-2 ${
                        isFull ? 'bg-gray-100 text-gray-400 cursor-not-allowed hidden' : 
                        isMember ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] uppercase tracking-[0.2em]' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-sm'
                    }`}
                  >
                    {isMember ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                        Comprar Cota
                      </>
                    ) : 'Entrar com Código'}
                  </button>
              </div>
            </div>
          );
        })}
      </div>

      {joiningPoolId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-emerald-950/90 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[48px] p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-50 rounded-[24px] flex items-center justify-center mb-6 text-emerald-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">Validar Cota</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed font-medium">Insira o código enviado pelo organizador para confirmar sua participação.</p>
            
            <input 
              autoFocus
              type="text"
              placeholder="CÓDIGO"
              className="w-full p-6 bg-gray-50 border-2 border-transparent rounded-[32px] text-center font-black text-2xl tracking-[0.4em] uppercase focus:border-emerald-500 focus:bg-white outline-none mb-8 transition-all shadow-inner"
              value={accessCode}
              onChange={e => setAccessCode(e.target.value)}
            />

            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmJoin}
                className="w-full bg-emerald-600 text-white font-black py-5 rounded-[28px] shadow-xl hover:bg-emerald-700 active:scale-95 transition-all text-lg"
              >
                Validar Agora
              </button>
              <button 
                onClick={() => { setJoiningPoolId(null); setAccessCode(''); }}
                className="w-full py-4 font-black text-gray-400 hover:text-gray-600 transition-colors uppercase text-[10px] tracking-widest"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoolList;
