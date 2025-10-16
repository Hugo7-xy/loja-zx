// js/app.js

// --- 1. CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();
export const functions = firebase.functions(); // Adicionado para Cloud Functions
console.log("Firebase conectado.");

// --- 2. IMPORTAÇÃO DOS MÓDULOS ---
import { initAuth } from './auth.js';
import { initLayout } from './layout.js';
import { initChannels } from './channels.js';
import { initSystemProdutos } from './systemprodutos.js';

// --- 3. ORQUESTRAÇÃO ---
async function main() {
    console.log("ZX Store: Iniciando módulos...");

    await initChannels();

    // initAuth agora cuida da inicialização dos painéis de vendedor/admin
    initAuth(); 
    
    initLayout();
    initSystemProdutos();

    console.log("ZX Store: Todos os módulos foram inicializados.");
}

document.addEventListener('DOMContentLoaded', main);
