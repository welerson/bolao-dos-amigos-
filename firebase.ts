
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCrF8nphHnsxHf2r4s-jU8WsYRAnwAxSfo",
  authDomain: "bolao-jogos.firebaseapp.com",
  projectId: "bolao-jogos",
  storageBucket: "bolao-jogos.firebasestorage.app",
  messagingSenderId: "516531866990",
  appId: "1:516531866990:web:3004a504bfa898aa89c57f",
  measurementId: "G-VLMLTT2L9C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
