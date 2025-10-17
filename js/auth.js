// js/auth.js

import { auth, firestore } from './app.js';
import { initSystemVendedor } from './systemvendedor.js';
import { initSystemMestre } from './systemmestre.js';

// --- Seleção de Elementos Globais do Módulo ---
let openMenuBtn, closeMenuBtn, sidePanel, panelOverlay, loggedOutView, loggedInView;
let googleLoginBtn, emailLoginForm, logoutBtn, userDisplayName, goToDashboardBtn;
let sellerDashboardModal;

function updateUserUI(user, sellerData, isSeller, isAdmin) {
    if (user) {
        loggedOutView.classList.add('hidden');
        loggedInView.classList.remove('hidden');
        userDisplayName.textContent = sellerData?.name || user.displayName || 'Usuário';
        if (isSeller || isAdmin) {
            goToDashboardBtn.classList.remove('hidden');
        } else {
            goToDashboardBtn.classList.add('hidden');
        }
    } else {
        loggedOutView.classList.remove('hidden');
        loggedInView.classList.add('hidden');
        userDisplayName.textContent = '';
        goToDashboardBtn.classList.add('hidden');
    }
}

export function initAuth() {
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
        }, 300);
    });

    auth.onAuthStateChanged(async user => {
        if (user) {
            try {
                const adminDoc = await firestore.collection('admins').doc(user.uid).get();
                const sellerDoc = await firestore.collection('sellers').doc(user.uid).get();
                const isAdmin = adminDoc.exists;
                const isSeller = sellerDoc.exists;
                const sellerData = isSeller ? sellerDoc.data() : null;

                updateUserUI(user, sellerData, isSeller, isAdmin);

                if (isAdmin) {
                    initSystemMestre(user);
                    initSystemVendedor(user, sellerData, true);
                } 
                else if (isSeller) {
                    initSystemVendedor(user, sellerData, false);
                }
            } catch (error) {
                console.error("Erro ao buscar dados do perfil no Firestore:", error);
                updateUserUI(user, null, false, false);
            }
        } else {
            updateUserUI(null, null, false, false);
        }
    });

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
