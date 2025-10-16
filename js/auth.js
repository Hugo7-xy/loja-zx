// js/auth.js

import { auth, firestore } from './app.js';
// Importa os inicializadores que ele agora é responsável por chamar
import { initSystemVendedor } from './systemvendedor.js';
import { initSystemMestre } from './systemmestre.js';

// --- Seleção de Elementos Globais do Módulo ---
let openMenuBtn, closeMenuBtn, sidePanel, panelOverlay, loggedOutView, loggedInView;
let googleLoginBtn, emailLoginForm, logoutBtn, userDisplayName, goToDashboardBtn;
let sellerDashboardModal;

/**
 * Atualiza a interface do usuário com base no estado de autenticação.
 * @param {object|null} user - O objeto do usuário do Firebase.
 * @param {boolean} isSeller - Se o usuário é um vendedor.
 * @param {boolean} isAdmin - Se o usuário é um administrador.
 */
function updateUserUI(user, isSeller, isAdmin) {
    if (user) {
        loggedOutView.classList.add('hidden');
        loggedInView.classList.remove('hidden');
        userDisplayName.textContent = user.displayName || 'Usuário';
        
        // Mostra o botão "Acessar Painel" se o usuário for vendedor OU admin
        if (isSeller || isAdmin) {
            goToDashboardBtn.classList.remove('hidden');
        } else {
            goToDashboardBtn.classList.add('hidden');
        }
    } else {
        // Visão de usuário deslogado
        loggedOutView.classList.remove('hidden');
        loggedInView.classList.add('hidden');
        userDisplayName.textContent = '';
        goToDashboardBtn.classList.add('hidden');
    }
}

/**
 * Função principal que será exportada.
 */
export function initAuth() {
    // Seleção de elementos do DOM (feita aqui para garantir que o HTML foi carregado)
    openMenuBtn = document.getElementById('open-menu-btn');
    closeMenuBtn = document.getElementById('close-menu-btn');
    sidePanel = document.getElementById('user-side-panel');
    panelOverlay = document.getElementById('panel-overlay');
    loggedOutView = document.getElementById('logged-out-view');
    loggedInView = document.getElementById('logged-in-view');
    googleLoginBtn = document.getElementById('google-login-btn');
    emailLoginForm = document.getElementById('panel-login-form');
    logoutBtn = document.getElementById('logout-btn-panel');
    userDisplayName = document.getElementById('user-display-name');
    goToDashboardBtn = document.getElementById('go-to-dashboard-btn');
    sellerDashboardModal = document.getElementById('seller-dashboard-modal');
    
    // Lógica para abrir/fechar o painel lateral
    const openPanel = () => sidePanel.classList.add('is-open');
    const closePanel = () => sidePanel.classList.remove('is-open');

    openMenuBtn.addEventListener('click', openPanel);
    closeMenuBtn.addEventListener('click', closePanel);
    panelOverlay.addEventListener('click', closePanel);

    goToDashboardBtn.addEventListener('click', (event) => {
        event.preventDefault();
        closePanel();
        setTimeout(() => {
            sellerDashboardModal.classList.remove('hidden');
        }, 300); // Pequeno delay para a animação do painel lateral terminar
    });

    // --- LÓGICA DE AUTENTICAÇÃO E PERMISSÕES ---
    auth.onAuthStateChanged(async user => {
        if (user) {
            // Se o usuário está logado, verificamos suas permissões
            const adminDoc = await firestore.collection('admins').doc(user.uid).get();
            const sellerDoc = await firestore.collection('sellers').doc(user.uid).get();
            const isAdmin = adminDoc.exists;
            const isSeller = sellerDoc.exists;

            updateUserUI(user, isSeller, isAdmin);

            // Se for admin, inicializa os dois sistemas.
            if (isAdmin) {
                initSystemMestre(user);
                initSystemVendedor(user, sellerDoc.data(), true); // true = visão de admin
            } 
            // Se for apenas vendedor, inicializa apenas o sistema de vendedor.
            else if (isSeller) {
                initSystemVendedor(user, sellerDoc.data(), false); // false = visão normal
            }
        } else {
            // Se o usuário está deslogado
            updateUserUI(null, false, false);
        }
    });

    // --- Ações de Login/Logout ---
    googleLoginBtn.addEventListener('click', async () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            await auth.signInWithPopup(provider);
            closePanel();
        } catch (error) {
            console.error("Erro no login com Google:", error.message);
        }
    });

    emailLoginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('panel-login-email').value;
        const password = document.getElementById('panel-login-password').value;
        try {
            await auth.signInWithEmailAndPassword(email, password);
            closePanel();
        } catch (error) {
            console.error("Erro no login com e-mail/senha:", error);
            alert("Falha no login. Verifique seu e-mail e senha.");
        }
    });

    logoutBtn.addEventListener('click', async () => {
        try {
            await auth.signOut();
            closePanel();
        } catch (error) {
            console.error("Erro ao fazer logout:", error.message);
        }
    });
}
