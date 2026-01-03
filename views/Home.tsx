
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { User, Pool, GameType } from '../types';

interface HomeProps {
  user: User | null;
  activePools: Pool[];
}

const Home: React.FC<HomeProps> = ({ user, activePools }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 pb-20">
      <header className="bg-emerald-600 text-white p-6 rounded-b-[40px] shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-emerald-100 text-xs">Olá,</p>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {user?.name}
              {user?.isAdmin && <span className="bg-amber-400 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-black uppercase">Admin</span>}
            </h2>
          </div>
          <button onClick={handleLogout} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>

        {activePools.length > 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100 mb-1">Meus Bolões</p>
            <h3 className="text-lg font-bold">Você está em {activePools.length} bolão(ões)</h3>
            <div className="flex justify-between items-end mt-4">
              <button 
                onClick={() => navigate(`/pools`)}
                className="bg-white text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
              >
                Ver Meus Jogos
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-emerald-100 italic text-sm">Você ainda não entrou em nenhum bolão.</div>
        )}
      </header>

      <main className="p-6 space-y-6">
        <div>
           <h3 className="font-black text-gray-800 text-lg mb-4">Escolha sua Sorte</h3>
           <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/pools')}
                className="p-6 bg-white rounded-[40px] shadow-sm border border-gray-100 flex flex-col items-center gap-3 transition-all active:scale-95"
              >
                <div className="w-14 h-14 bg-emerald-100 rounded-[22px] flex items-center justify-center text-emerald-600">
                   <span className="font-black text-xl">MS</span>
                </div>
                <span className="text-xs font-black text-gray-700 uppercase">Mega-Sena</span>
              </button>

              <button 
                onClick={() => navigate('/pools')}
                className="p-6 bg-white rounded-[40px] shadow-sm border border-gray-100 flex flex-col items-center gap-3 transition-all active:scale-95"
              >
                <div className="w-14 h-14 bg-purple-100 rounded-[22px] flex items-center justify-center text-purple-600">
                   <span className="font-black text-xl">LF</span>
                </div>
                <span className="text-xs font-black text-gray-700 uppercase">Lotofácil</span>
              </button>
           </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-black text-gray-800 text-lg">Menu</h3>
          <div className="grid grid-cols-1 gap-3">
             {user?.isAdmin && (
                <button 
                  onClick={() => navigate('/create')}
                  className="w-full flex items-center gap-4 p-5 bg-gray-900 text-white rounded-[32px] shadow-xl"
                >
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <span className="font-black uppercase text-xs tracking-widest">Criar Novo Bolão</span>
                </button>
             )}
             
             <button 
                onClick={() => navigate('/how-it-works')}
                className="w-full flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-[32px] shadow-sm"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="font-black uppercase text-xs tracking-widest text-gray-700">Como Funciona</span>
              </button>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex justify-around p-4 z-50">
        <button onClick={() => navigate('/home')} className="text-emerald-600 flex flex-col items-center">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
          <span className="text-[10px] font-bold uppercase mt-1">Home</span>
        </button>
        <button onClick={() => navigate('/pools')} className="text-gray-400 flex flex-col items-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          <span className="text-[10px] font-bold uppercase mt-1">Bolões</span>
        </button>
      </div>
    </div>
  );
};

export default Home;
