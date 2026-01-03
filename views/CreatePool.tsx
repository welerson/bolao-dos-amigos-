
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pool, PoolCapacity, PoolStatus } from '../types';

interface CreatePoolProps {
  onCreated: (pool: Pool) => void;
  adminId: string;
}

const CreatePool: React.FC<CreatePoolProps> = ({ onCreated, adminId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: PoolCapacity.A,
    price: 50,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPool: Pool = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      description: formData.description,
      capacity: formData.capacity,
      price: formData.price,
      status: PoolStatus.AWAITING,
      participantsIds: [adminId], // Admin automatically participates
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
        <h2 className="text-xl font-bold">Criar Novo Bolão</h2>
      </header>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1.5 ml-1">Título do Bolão</label>
            <input 
              required
              type="text" 
              className="w-full p-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
              placeholder="Ex: Amigos do Futebol"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1.5 ml-1">Descrição</label>
            <textarea 
              rows={3}
              className="w-full p-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
              placeholder="Descreva o bolão..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1.5 ml-1">Capacidade (Participantes)</label>
            <div className="grid grid-cols-2 gap-3">
              {[100, 300, 500, 1000].map(cap => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => setFormData({...formData, capacity: cap})}
                  className={`p-4 rounded-2xl border font-bold text-sm transition-all ${
                    formData.capacity === cap ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' : 'bg-white text-gray-500 border-gray-100 hover:border-emerald-200'
                  }`}
                >
                  {cap} Pessoas
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1.5 ml-1">Valor por Participante (R$)</label>
            <input 
              required
              type="number" 
              className="w-full p-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
              placeholder="0.00"
              value={formData.price}
              onChange={e => setFormData({...formData, price: Number(e.target.value)})}
            />
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-5 rounded-3xl shadow-xl hover:bg-emerald-700 active:scale-95 transition-all">
            Publicar Bolão
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePool;
