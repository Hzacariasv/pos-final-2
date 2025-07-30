// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCdG8ZudnO9TOEtKKqm-viL-NILr1y5bOs",
    authDomain: "my-pos-restaurant-8e1a2.firebaseapp.com",
    projectId: "my-pos-restaurant-8e1a2",
    storageBucket: "my-pos-restaurant-8e1a2.firebasestorage.app",
    messagingSenderId: "97513379329",
    appId: "1:97513379329:web:ed3dcd3e31e338051c5200"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);