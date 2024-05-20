import { getAuth } from "@firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA1K3bo2tj3fLASLvhuPvHnQY1PfLJuUeA",
  authDomain: "paybank-2ea40.firebaseapp.com",
  databaseURL: "https://paybank-2ea40-default-rtdb.firebaseio.com",
  projectId: "paybank-2ea40",
  storageBucket: "paybank-2ea40.appspot.com",
  messagingSenderId: "304853068624",
  appId: "1:304853068624:web:2b764353fbe95d506e9a55",
  measurementId: "G-JDPMMYNHW7",
};

const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);

const auth = getAuth(firebaseApp);

export { db, auth };
export const persistence = getReactNativePersistence(AsyncStorage); 