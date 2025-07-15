// firebase.ts
'use client';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCAeDjVBVQAG6s-K02OcX9CQAbM2qfI_Ik",
  authDomain: "online-learning-f9d31.firebaseapp.com",
  projectId: "online-learning-f9d31",
  storageBucket: "online-learning-f9d31.firebasestorage.app",
  messagingSenderId: "350760694414",
  appId: "1:350760694414:web:a62e153a0068e5b9ff0fdf",
};

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

export { messaging, getToken, onMessage };
