
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { collection, onSnapshot, query, doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from './firebase';
import { User, Pool, PoolStatus, Guess } from './types';
import Login from './views/Login';
import Home from './views/Home';
import PoolList from './views/PoolList';
import CreatePool from './views/CreatePool';
import PoolDetail from './views/PoolDetail';
import HowItWorks from './views/HowItWorks';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pools, setPools] = useState<Pool[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [notifications, setNotifications] = useState<{id: number, msg: string}[]>([]);

  // Monitorar Usuário (Firebase Auth)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser({
          id: user.uid,
          name: user.displayName || 'Participante',
          email: user.email || '',
          phone: '',
          isAdmin: false
        });
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sincronizar Bolões do Firestore
  useEffect(() => {
    const q = query(collection(db, 'pools'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const poolsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pool));
      setPools(poolsData);
    });
    return () => unsubscribe();
  }, []);

  // Sincronizar Palpites do Firestore
  useEffect(() => {
    const q = query(collection(db, 'guesses'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const guessesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Guess));
      setGuesses(guessesData);
    });
    return () => unsubscribe();
  }, []);

  const addNotification = (msg: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
  };

  const addPool = async (pool: Pool) => {
    try {
      await setDoc(doc(db, 'pools', pool.id), pool);
      addNotification("Bolão criado com sucesso!");
    } catch (e) {
      addNotification("Erro ao criar bolão.");
    }
  };

  const joinPool = async (poolId: string) => {
    if (!currentUser) return;
    try {
      const poolRef = doc(db, 'pools', poolId);
      const pool = pools.find(p => p.id === poolId);
      if (pool && !pool.participantsIds.includes(currentUser.id)) {
        const isFull = pool.participantsIds.length + 1 >= pool.capacity;
        await updateDoc(poolRef, {
          participantsIds: arrayUnion(currentUser.id),
          status: isFull ? PoolStatus.FULL : pool.status
        });
        addNotification("Você entrou no bolão!");
      }
    } catch (e) {
      addNotification("Erro ao entrar no bolão.");
    }
  };

  const saveGuess = async (guess: Guess) => {
    try {
      const guessId = `${guess.poolId}_${guess.userId}`;
      await setDoc(doc(db, 'guesses', guessId), guess);
      addNotification("Seu palpite foi registrado!");
    } catch (e) {
      addNotification("Erro ao salvar palpite.");
    }
  };

  return (
    <Router>
      <div className="min-h-screen max-w-md mx-auto bg-gray-50 flex flex-col shadow-2xl relative overflow-hidden border-x border-gray-200">
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[320px] pointer-events-none flex flex-col gap-2">
          {notifications.map(n => (
            <div key={n.id} className="bg-emerald-900/90 backdrop-blur text-white px-4 py-3 rounded-2xl text-sm font-bold shadow-xl animate-bounce text-center">
              {n.msg}
            </div>
          ))}
        </div>

        <Routes>
          <Route path="/" element={<Login onLogin={setCurrentUser} />} />
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
