
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { User, Pool } from '../types';

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
            <p className="text-emerald-100 text-sm">Olá,</p>
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
              <div className="flex -space-x-2">
                {activePools.slice(0, 3).map((p, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-emerald-600 flex items-center justify-center text-[10px] font-bold">
                    {p.name.charAt(0)}
                  </div>
                ))}
              </div>
              <button 
                onClick={() => navigate(`/pools`)}
                className="bg-white text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
              >
                Ver Todos
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-emerald-100 italic text-sm">Você ainda não entrou em nenhum bolão.</div>
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
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <span className="text-sm font-bold text-gray-700 text-center">Explorar Bolões</span>
          </button>

          {user?.isAdmin && (
            <button 
              onClick={() => navigate('/create')}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-gray-100 hover:border-amber-200 transition-colors"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              </div>
              <span className="text-sm font-bold text-gray-700 text-center">Criar Bolão</span>
            </button>
          )}

          <button 
            onClick={() => navigate('/how-it-works')}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-gray-100"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-sm font-bold text-gray-700 text-center">Ajuda</span>
          </button>

          <button 
            className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-gray-100 opacity-50 cursor-not-allowed"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <span className="text-sm font-bold text-gray-700 text-center">Estatísticas</span>
          </button>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex justify-around p-4 z-50">
        <button onClick={() => navigate('/home')} className="text-emerald-600 flex flex-col items-center">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
          <span className="text-[10px] font-bold">Início</span>
        </button>
        <button onClick={() => navigate('/pools')} className="text-gray-400 flex flex-col items-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          <span className="text-[10px] font-bold">Bolões</span>
        </button>
      </div>
    </div>
  );
};

export default Home;
