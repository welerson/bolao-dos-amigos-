
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pool, PoolCapacity, PoolStatus, GameType, PoolBetType } from '../types';
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
    betType: PoolBetType.INDIVIDUAL,
    requiredPicks: 6,
    officialTicketSize: 6,
    capacity: PoolCapacity.A,
    price: 50,
  });

  useEffect(() => {
    if (formData.gameType === GameType.LOTOFACIL) {
      setFormData(prev => ({ ...prev, requiredPicks: 15, officialTicketSize: 15 }));
    } else {
      setFormData(prev => ({ ...prev, requiredPicks: 6, officialTicketSize: 6 }));
    }
  }, [formData.gameType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPool: Pool = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      description: formData.description,
      gameType: formData.gameType,
      betType: formData.betType,
      requiredPicks: formData.requiredPicks,
      officialTicketSize: formData.officialTicketSize,
      capacity: formData.capacity,
      price: formData.price + APP_PLATFORM_FEE,
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

  const isMega = formData.gameType === GameType.MEGA_SENA;
  const isColab = formData.betType === PoolBetType.COLLABORATIVE;

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-screen overflow-y-auto pb-24 no-scrollbar">
      <header className="p-6 flex items-center gap-4 sticky top-0 bg-gray-50/80 backdrop-blur-md z-10">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-black">Criar Bolão</h2>
      </header>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        <section className="space-y-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Modalidade e Tipo de Jogo</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({...formData, gameType: GameType.MEGA_SENA})}
              className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-2 ${
                isMega ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-transparent bg-white text-gray-300'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${isMega ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-300'}`}>MS</div>
              <span className="font-black text-[10px] uppercase">Mega-Sena</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, gameType: GameType.LOTOFACIL})}
              className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-2 ${
                !isMega ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-transparent bg-white text-gray-300'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${!isMega ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-300'}`}>LF</div>
              <span className="font-black text-[10px] uppercase">Lotofácil</span>
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Estratégia de Aposta</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({...formData, betType: PoolBetType.INDIVIDUAL})}
              className={`p-4 rounded-3xl border-2 transition-all text-center ${
                !isColab ? 'border-gray-800 bg-gray-800 text-white shadow-lg' : 'border-transparent bg-white text-gray-400'
              }`}
            >
              <span className="font-black text-[10px] uppercase block mb-1">Individual</span>
              <p className="text-[8px] leading-tight">Cada um joga seu bilhete simples.</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, betType: PoolBetType.COLLABORATIVE})}
              className={`p-4 rounded-3xl border-2 transition-all text-center ${
                isColab ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg' : 'border-transparent bg-white text-gray-400'
              }`}
            >
              <span className="font-black text-[10px] uppercase block mb-1">Mais Votados</span>
              <p className="text-[8px] leading-tight">O sistema gera o bilhete oficial com os mais marcados.</p>
            </button>
          </div>
        </section>

        <section className="space-y-6 bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Nome do Grupo</label>
            <input 
              required
              type="text" 
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold focus:border-emerald-500 outline-none transition-all" 
              placeholder="Ex: Mega Master 14"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Votos p/ Usuário</label>
              <input 
                required
                type="number" 
                min={isMega ? 6 : 15}
                max={20}
                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-black text-center focus:border-emerald-500 outline-none transition-all" 
                value={formData.requiredPicks}
                onChange={e => setFormData({...formData, requiredPicks: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Bilhete Oficial</label>
              <input 
                required
                disabled={!isColab}
                type="number" 
                min={isMega ? 6 : 15}
                max={20}
                className={`w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-black text-center focus:border-emerald-500 outline-none transition-all ${!isColab ? 'opacity-30' : ''}`} 
                value={isColab ? formData.officialTicketSize : formData.requiredPicks}
                onChange={e => setFormData({...formData, officialTicketSize: Number(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Valor do Jogo (Base)</label>
            <div className="relative">
              <input 
                required
                type="number" 
                className="w-full p-4 pl-10 bg-gray-50 border-2 border-transparent rounded-2xl font-black text-center focus:border-emerald-500 outline-none transition-all" 
                value={formData.price}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-300 text-xs">R$</span>
            </div>
          </div>
        </section>

        <section className="bg-emerald-900 text-white p-8 rounded-[40px] shadow-xl">
           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-50">Resumo Financeiro por Cota</h4>
           <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-70">Valor do Jogo</span>
                <span className="font-bold">{formatCurrency(formData.price)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-70">Taxa Aplicativo</span>
                <span className="font-bold">{formatCurrency(APP_PLATFORM_FEE)}</span>
              </div>
              <div className="h-px bg-white/10 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase">Total p/ Usuário</span>
                <span className="text-2xl font-black text-emerald-400">{formatCurrency(formData.price + APP_PLATFORM_FEE)}</span>
              </div>
           </div>
        </section>

        <button type="submit" className="w-full bg-emerald-600 text-white font-black py-6 rounded-[32px] shadow-xl hover:bg-emerald-700 active:scale-95 transition-all">
          Lançar Bolão Oficial
        </button>
      </form>
    </div>
  );
};

export default CreatePool;
