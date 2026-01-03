
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pool, PoolCapacity, PoolStatus, GameType } from '../types';
import { GAME_CONFIG, APP_PLATFORM_FEE } from '../constants';
import { formatCurrency } from '../utils';

interface CreatePoolProps {
  onCreated: (pool: Pool) => void;
  adminId: string;
}

const CreatePool: React.FC<CreatePoolProps> = ({ onCreated, adminId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gameType: GameType.MEGA_SENA,
    capacity: PoolCapacity.A,
    price: 50,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPool: Pool = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      description: formData.description,
      gameType: formData.gameType,
      capacity: formData.capacity,
      price: formData.price,
      status: PoolStatus.AWAITING,
      participantsIds: [adminId],
      draws: [
        { id: 1, date: '', numbers: [] },
        { id: 2, date: '', numbers: [] },
        { id: 3, date: '', numbers: [] },
      ],
      adminId,
      createdAt: new Date().toISOString(),
    };
    onCreated(newPool);
    navigate('/pools');
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <header className="p-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-black">Criar Novo Bolão</h2>
      </header>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 pb-24">
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-1">Tipo de Jogo</label>
            <div className="grid grid-cols-2 gap-3">
              {[GameType.MEGA_SENA, GameType.LOTOFACIL].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({...formData, gameType: type})}
                  className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${
                    formData.gameType === type 
                    ? type === GameType.MEGA_SENA ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-transparent bg-white text-gray-400'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${
                    type === GameType.MEGA_SENA ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white'
                  }`}>
                    {type === GameType.MEGA_SENA ? 'MS' : 'LF'}
                  </div>
                  <span className="font-black text-xs uppercase">{GAME_CONFIG[type].name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Título do Bolão</label>
            <input 
              required
              type="text" 
              className="w-full p-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none font-bold" 
              placeholder="Ex: Mega dos Amigos"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Custo da Cota (R$)</label>
            <input 
              required
              type="number" 
              className="w-full p-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none font-black text-xl" 
              value={formData.price}
              onChange={e => setFormData({...formData, price: Number(e.target.value)})}
            />
            <p className="text-[9px] text-gray-400 font-bold mt-2 ml-1">
              * Inclui taxa de {formatCurrency(APP_PLATFORM_FEE)} da plataforma por cota.
            </p>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-1">Capacidade</label>
            <div className="grid grid-cols-2 gap-3">
              {[100, 300, 500, 1000].map(cap => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => setFormData({...formData, capacity: cap})}
                  className={`p-4 rounded-2xl border font-black text-xs transition-all ${
                    formData.capacity === cap ? 'bg-gray-800 text-white shadow-lg' : 'bg-white text-gray-400 border-gray-100'
                  }`}
                >
                  {cap} Cotas
                </button>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" className="w-full bg-emerald-600 text-white font-black py-5 rounded-[32px] shadow-xl hover:bg-emerald-700 active:scale-95 transition-all mt-6">
          Criar Bolão Oficial
        </button>
      </form>
    </div>
  );
};

export default CreatePool;
