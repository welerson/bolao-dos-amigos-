
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { collection, onSnapshot, query, doc, setDoc, getDoc, updateDoc, arrayUnion, where, getDocs, limit, addDoc } from 'firebase/firestore';
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
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setCurrentUser(userDoc.data() as User);
        } else {
          const basicUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Participante',
            email: firebaseUser.email || '',
            phone: '',
            isAdmin: false
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), basicUser);
          setCurrentUser(basicUser);
        }
      } else {
        setCurrentUser(null);
        setPools([]);
        setGuesses([]);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'pools'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const poolsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pool));
      setPools(poolsData);
    });
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'guesses'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const guessesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Guess));
      setGuesses(guessesData);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const addNotification = (msg: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  const addPool = async (pool: Pool) => {
    try {
      await setDoc(doc(db, 'pools', pool.id), pool);
      addNotification("Bolão criado! Gere os códigos para convidar.");
    } catch (e) {
      addNotification("Erro ao criar bolão.");
    }
  };

  const joinPoolWithCode = async (poolId: string, code: string) => {
    if (!currentUser) return;
    try {
      const pool = pools.find(p => p.id === poolId);
      if (!pool) return;

      const codesRef = collection(db, 'pool_codes');
      const q = query(codesRef, where('code', '==', code), where('poolId', '==', poolId), where('used', '==', false), limit(1));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        addNotification("Código inválido ou já utilizado!");
        return;
      }

      const codeDoc = querySnapshot.docs[0];
      const poolRef = doc(db, 'pools', poolId);

      // Marca código como usado
      await updateDoc(doc(db, 'pool_codes', codeDoc.id), {
        used: true,
        usedBy: currentUser.id
      });

      // Adiciona participante (permite duplicata para representar múltiplas cotas)
      const newParticipants = [...pool.participantsIds, currentUser.id];
      const isFull = newParticipants.length >= pool.capacity;
      
      await updateDoc(poolRef, {
        participantsIds: newParticipants,
        status: isFull ? PoolStatus.FULL : pool.status
      });

      addNotification("Nova cota adquirida com sucesso!");
    } catch (e) {
      console.error(e);
      addNotification("Erro ao validar código.");
    }
  };

  const saveGuess = async (guess: Guess) => {
    if (!currentUser) return;
    try {
      // Se o palpite já tem ID, significa que estamos tentando sobrescrever um salvo
      // A UI deve bloquear isso, mas garantimos aqui também.
      const existing = guesses.find(g => g.id === guess.id && g.numbers.length > 0);
      if (existing) {
        addNotification("Este palpite já foi bloqueado.");
        return;
      }

      // Salva com ID único para permitir múltiplas cotas
      const guessId = guess.id || `${guess.poolId}_${currentUser.id}_${Date.now()}`;
      await setDoc(doc(db, 'guesses', guessId), {
        ...guess,
        id: guessId,
        userName: currentUser.name
      });
      addNotification("Palpite salvo e bloqueado para alterações!");
    } catch (e) {
      addNotification("Erro ao salvar palpite.");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-700 text-white font-bold">
        Iniciando Bolão...
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen max-w-md mx-auto bg-gray-50 flex flex-col shadow-2xl relative overflow-hidden">
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[320px] pointer-events-none flex flex-col gap-2">
          {notifications.map(n => (
            <div key={n.id} className="bg-emerald-900/95 backdrop-blur-md text-white px-5 py-4 rounded-3xl text-sm font-bold shadow-2xl text-center border border-white/10 animate-in slide-in-from-top duration-300">
              {n.msg}
            </div>
          ))}
        </div>

        <Routes>
          <Route path="/" element={currentUser ? <Navigate to="/home" /> : <Login onLogin={setCurrentUser} />} />
          <Route path="/home" element={currentUser ? <Home user={currentUser} activePools={pools.filter(p => p.participantsIds.includes(currentUser?.id || ''))} /> : <Navigate to="/" />} />
          <Route path="/pools" element={currentUser ? <PoolList pools={pools} onJoin={joinPoolWithCode} userId={currentUser?.id} /> : <Navigate to="/" />} />
          <Route path="/create" element={currentUser?.isAdmin ? <CreatePool onCreated={addPool} adminId={currentUser?.id || ''} /> : <Navigate to="/home" />} />
          <Route path="/pool/:id" element={currentUser ? <PoolDetail pools={pools} setPools={setPools} guesses={guesses} onSaveGuess={saveGuess} userId={currentUser?.id || ''} notify={addNotification} isAdmin={currentUser.isAdmin} /> : <Navigate to="/" />} />
          <Route path="/how-it-works" element={currentUser ? <HowItWorks /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
