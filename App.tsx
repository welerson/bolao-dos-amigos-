
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { collection, onSnapshot, query, doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
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

  // 1. Monitorar estado de autenticação e buscar Perfil no Firestore
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Busca dados adicionais (como isAdmin) no Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setCurrentUser(userDoc.data() as User);
        } else {
          // Caso o documento não exista (falha na criação), cria um perfil básico
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

  // 2. Sincronizar Bolões
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'pools'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const poolsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pool));
      setPools(poolsData);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // 3. Sincronizar Palpites
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-700 text-white font-bold">
        Carregando...
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen max-w-md mx-auto bg-gray-50 flex flex-col shadow-2xl relative overflow-hidden">
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[320px] pointer-events-none flex flex-col gap-2">
          {notifications.map(n => (
            <div key={n.id} className="bg-emerald-900/90 backdrop-blur text-white px-4 py-3 rounded-2xl text-sm font-bold shadow-xl text-center">
              {n.msg}
            </div>
          ))}
        </div>

        <Routes>
          <Route path="/" element={currentUser ? <Navigate to="/home" /> : <Login onLogin={setCurrentUser} />} />
          <Route path="/home" element={currentUser ? <Home user={currentUser} activePools={pools.filter(p => p.participantsIds.includes(currentUser?.id || ''))} /> : <Navigate to="/" />} />
          <Route path="/pools" element={currentUser ? <PoolList pools={pools} onJoin={joinPool} userId={currentUser?.id} /> : <Navigate to="/" />} />
          <Route path="/create" element={currentUser?.isAdmin ? <CreatePool onCreated={addPool} adminId={currentUser?.id || ''} /> : <Navigate to="/home" />} />
          <Route path="/pool/:id" element={currentUser ? <PoolDetail pools={pools} setPools={setPools} guesses={guesses} onSaveGuess={saveGuess} userId={currentUser?.id || ''} notify={addNotification} isAdmin={currentUser.isAdmin} /> : <Navigate to="/" />} />
          <Route path="/how-it-works" element={currentUser ? <HowItWorks /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
