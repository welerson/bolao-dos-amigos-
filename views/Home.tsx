
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
    <div className="flex-1 flex flex-col bg-gray-50 pb-20 overflow-y-auto no-scrollbar">
      <header className="bg-emerald-600 text-white p-6 rounded-b-[48px] shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-black text-xl">
                {user?.name?.charAt(0)}
             </div>
             <div>
                <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest">Seja bem-vindo</p>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  {user?.name.split(' ')[0]}
                  {user?.isAdmin && <span className="bg-amber-400 text-amber-900 text-[8px] px-2 py-0.5 rounded-full font-black uppercase">Admin</span>}
                </h2>
             </div>
          </div>
          <button onClick={handleLogout} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>

        {activePools.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-[32px] p-5 border border-white/20">
            <div className="flex justify-between items-center">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Participação Ativa</p>
                  <h3 className="text-lg font-black">{activePools.length} Bolões no Ar</h3>
               </div>
               <button onClick={() => navigate(`/pools`)} className="bg-white text-emerald-600 h-10 w-10 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
               </button>
            </div>
          </div>
        )}
      </header>

      <main className="p-6 space-y-8">
        <div>
           <h3 className="font-black text-gray-800 text-lg mb-4 ml-2">Explorar Modalidades</h3>
           <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => navigate('/pools')}
                className="p-6 bg-white rounded-[40px] shadow-sm border border-gray-100 flex items-center gap-5 transition-all active:scale-95 group"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-[24px] flex items-center justify-center text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                   <span className="font-black text-2xl">MS</span>
                </div>
                <div className="text-left">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">3 Sorteios Semanais</span>
                    <h4 className="text-xl font-black text-gray-800">Mega-Sena</h4>
                </div>
              </button>

              <button 
                onClick={() => navigate('/pools')}
                className="p-6 bg-white rounded-[40px] shadow-sm border border-gray-100 flex items-center gap-5 transition-all active:scale-95 group"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-[24px] flex items-center justify-center text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                   <span className="font-black text-2xl">LF</span>
                </div>
                <div className="text-left">
                    <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest">6 Sorteios Semanais</span>
                    <h4 className="text-xl font-black text-gray-800">Lotofácil</h4>
                </div>
              </button>
           </div>
        </div>

        {user?.isAdmin && (
           <div className="space-y-4">
              <h3 className="font-black text-gray-800 text-lg ml-2">Painel Gestor</h3>
              <button 
                onClick={() => navigate('/create')}
                className="w-full flex items-center gap-5 p-6 bg-gray-900 text-white rounded-[40px] shadow-xl relative overflow-hidden group"
              >
                <div className="w-14 h-14 bg-emerald-500 rounded-[20px] flex items-center justify-center relative z-10 transition-transform group-hover:rotate-90">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                </div>
                <div className="text-left relative z-10">
                   <h4 className="font-black text-lg">Novo Bolão</h4>
                   <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Criar evento oficial</p>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mt-16 -mr-16 blur-2xl"></div>
              </button>
           </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-gray-100 flex justify-around p-4 pb-6 z-50">
        <button onClick={() => navigate('/home')} className="flex flex-col items-center gap-1 group">
          <div className="p-2 rounded-xl group-active:scale-90 transition-all text-emerald-600 bg-emerald-50">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Home</span>
        </button>
        <button onClick={() => navigate('/pools')} className="flex flex-col items-center gap-1 group">
          <div className="p-2 rounded-xl group-active:scale-90 transition-all text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest text-gray-300">Jogos</span>
        </button>
      </div>
    </div>
  );
};

export default Home;
