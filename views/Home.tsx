
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Pool } from '../types';

interface HomeProps {
  user: User | null;
  activePools: Pool[];
}

const Home: React.FC<HomeProps> = ({ user, activePools }) => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-gray-50 pb-20">
      <header className="bg-emerald-600 text-white p-6 rounded-b-[40px] shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-emerald-100 text-sm">Olá,</p>
            <h2 className="text-2xl font-bold">{user?.name}</h2>
          </div>
          <button className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </button>
        </div>

        {activePools.length > 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100 mb-1">Bolão Ativo</p>
            <h3 className="text-lg font-bold">{activePools[0].name}</h3>
            <div className="flex justify-between items-end mt-4">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <img key={i} src={`https://picsum.photos/seed/${i}/32/32`} className="w-8 h-8 rounded-full border-2 border-emerald-600" alt="Avatar" />
                ))}
                <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-emerald-600 flex items-center justify-center text-[10px] font-bold">+{activePools[0].participantsIds.length - 3}</div>
              </div>
              <button 
                onClick={() => navigate(`/pool/${activePools[0].id}`)}
                className="bg-white text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
              >
                Ver Detalhes
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-emerald-100 italic">Você não participa de nenhum bolão no momento.</div>
        )}
      </header>

      <main className="p-6 space-y-4">
        <h3 className="font-bold text-gray-800 text-lg">Menu Principal</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/pools')}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-gray-100 hover:border-emerald-200 transition-colors"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </div>
            <span className="text-sm font-bold text-gray-700">Entrar em Bolão</span>
          </button>

          <button 
            onClick={() => navigate('/home')} // Filter view mock
            className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-gray-100"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <span className="text-sm font-bold text-gray-700">Meus Bolões</span>
          </button>

          <button 
            onClick={() => navigate('/create')}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-gray-100"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <span className="text-sm font-bold text-gray-700">Criar Bolão</span>
          </button>

          <button 
            onClick={() => navigate('/how-it-works')}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-gray-100"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-sm font-bold text-gray-700">Como funciona</span>
          </button>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex justify-around p-4">
        <button onClick={() => navigate('/home')} className="text-emerald-600">
          <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
          <span className="text-[10px] font-bold">Início</span>
        </button>
        <button onClick={() => navigate('/pools')} className="text-gray-400">
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          <span className="text-[10px] font-bold">Bolões</span>
        </button>
        <button onClick={() => navigate('/how-it-works')} className="text-gray-400">
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-[10px] font-bold">Ajuda</span>
        </button>
      </div>
    </div>
  );
};

export default Home;
