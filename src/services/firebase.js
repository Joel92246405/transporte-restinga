import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBTh6-Ihw6-GwtHN6gDIveLL43h92gy9kA",
  authDomain: "transporte-restinga.firebaseapp.com",
  projectId: "transporte-restinga",
  storageBucket: "transporte-restinga.firebasestorage.app",
  messagingSenderId: "1003150256421",
  appId: "1:1003150256421:web:0065b5044c03b7ccf8d2cc",
  measurementId: "G-MS2J9XYEPM"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);