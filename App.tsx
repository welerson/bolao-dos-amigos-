
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { MOCK_USER, MOCK_POOLS } from './constants';
import { User, Pool, PoolStatus, Guess } from './types';
import Login from './views/Login';
import Home from './views/Home';
import PoolList from './views/PoolList';
import CreatePool from './views/CreatePool';
import PoolDetail from './views/PoolDetail';
import HowItWorks from './views/HowItWorks';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USER);
  const [pools, setPools] = useState<Pool[]>(MOCK_POOLS);
  const [guesses, setGuesses] = useState<Guess[]>([]);

  const addPool = (pool: Pool) => {
    setPools(prev => [pool, ...prev]);
  };

  const joinPool = (poolId: string) => {
    if (!currentUser) return;
    setPools(prev => prev.map(p => {
      if (p.id === poolId && !p.participantsIds.includes(currentUser.id)) {
        const newParticipants = [...p.participantsIds, currentUser.id];
        const isFull = newParticipants.length >= p.capacity;
        return { 
          ...p, 
          participantsIds: newParticipants,
          status: isFull ? PoolStatus.FULL : p.status
        };
      }
      return p;
    }));
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
  };

  return (
    <Router>
      <div className="min-h-screen max-w-md mx-auto bg-gray-50 flex flex-col shadow-2xl relative overflow-hidden">
        <Routes>
          <Route path="/" element={<Login onLogin={setCurrentUser} />} />
          <Route path="/home" element={<Home user={currentUser} activePools={pools.filter(p => p.participantsIds.includes(currentUser?.id || ''))} />} />
          <Route path="/pools" element={<PoolList pools={pools} onJoin={joinPool} userId={currentUser?.id} />} />
          <Route path="/create" element={<CreatePool onCreated={addPool} adminId={currentUser?.id || ''} />} />
          <Route path="/pool/:id" element={<PoolDetail pools={pools} setPools={setPools} guesses={guesses} onSaveGuess={saveGuess} userId={currentUser?.id || ''} />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
