
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { MOCK_USER, MOCK_POOLS } from './constants';
import { User, Pool, PoolStatus, Guess } from './types';
import Login from './views/Login';
import Home from './views/Home';
import PoolList from './views/PoolList';
import CreatePool from './views/CreatePool';
import PoolDetail from './views/PoolDetail';
import HowItWorks from './views/HowItWorks';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bolao_user');
    return saved ? JSON.parse(saved) : MOCK_USER;
  });

  const [pools, setPools] = useState<Pool[]>(() => {
    const saved = localStorage.getItem('bolao_pools');
    return saved ? JSON.parse(saved) : MOCK_POOLS;
  });

  const [guesses, setGuesses] = useState<Guess[]>(() => {
    const saved = localStorage.getItem('bolao_guesses');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<{id: number, msg: string}[]>([]);

  useEffect(() => {
    localStorage.setItem('bolao_pools', JSON.stringify(pools));
  }, [pools]);

  useEffect(() => {
    localStorage.setItem('bolao_guesses', JSON.stringify(guesses));
  }, [guesses]);

  const addNotification = (msg: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
  };

  const addPool = (pool: Pool) => {
    setPools(prev => [pool, ...prev]);
    addNotification("Bolão criado com sucesso!");
  };

  const joinPool = (poolId: string) => {
    if (!currentUser) return;
    setPools(prev => prev.map(p => {
      if (p.id === poolId && !p.participantsIds.includes(currentUser.id)) {
        const newParticipants = [...p.participantsIds, currentUser.id];
        const isFull = newParticipants.length >= p.capacity;
        if (isFull) addNotification("O bolão atingiu a capacidade máxima!");
        return { 
          ...p, 
          participantsIds: newParticipants,
          status: isFull ? PoolStatus.FULL : p.status
        };
      }
      return p;
    }));
    addNotification("Você entrou no bolão!");
  };

  const saveGuess = (guess: Guess) => {
    setGuesses(prev => {
      const existing = prev.findIndex(g => g.poolId === guess.poolId && g.userId === guess.userId);
      if (existing > -1) {
        const newGuesses = [...prev];
        newGuesses[existing] = guess;
        return newGuesses;
      }
      return [...prev, guess];
    });
    addNotification("Seu palpite foi registrado!");
  };

  return (
    <Router>
      <div className="min-h-screen max-w-md mx-auto bg-gray-50 flex flex-col shadow-2xl relative overflow-hidden border-x border-gray-200">
        {/* Toast Notifications */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[320px] pointer-events-none flex flex-col gap-2">
          {notifications.map(n => (
            <div key={n.id} className="bg-gray-900/90 backdrop-blur text-white px-4 py-3 rounded-2xl text-sm font-bold shadow-xl animate-bounce text-center">
              {n.msg}
            </div>
          ))}
        </div>

        <Routes>
          <Route path="/" element={<Login onLogin={(u) => { setCurrentUser(u); localStorage.setItem('bolao_user', JSON.stringify(u)); }} />} />
          <Route path="/home" element={<Home user={currentUser} activePools={pools.filter(p => p.participantsIds.includes(currentUser?.id || ''))} />} />
          <Route path="/pools" element={<PoolList pools={pools} onJoin={joinPool} userId={currentUser?.id} />} />
          <Route path="/create" element={<CreatePool onCreated={addPool} adminId={currentUser?.id || ''} />} />
          <Route path="/pool/:id" element={<PoolDetail pools={pools} setPools={setPools} guesses={guesses} onSaveGuess={saveGuess} userId={currentUser?.id || ''} notify={addNotification} />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
