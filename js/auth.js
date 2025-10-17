// js/auth.js

import { auth, firestore } from './app.js';
import { initSystemVendedor } from './systemvendedor.js';
import { initSystemMestre } from './systemmestre.js';
import { showLoading, hideLoading, showToast } from './ui.js'; // Importa as novas funções de UI

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
    // Seleção de elementos do DOM
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
    const registerForm = document.getElementById('register-form');
    const registerModal = document.getElementById('register-modal');
    
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
        }, 300);
    });

    // --- LÓGICA DE AUTENTICAÇÃO E PERMISSÕES ---
    auth.onAuthStateChanged(async user => {
        if (user) {
            const adminDoc = await firestore.collection('admins').doc(user.uid).get();
            const sellerDoc = await firestore.collection('sellers').doc(user.uid).get();
            const isAdmin = adminDoc.exists;
            const isSeller = sellerDoc.exists;
            const sellerData = isSeller ? sellerDoc.data() : null;
            updateUserUI(user, sellerData, isSeller, isAdmin);
            if (isAdmin) {
                initSystemMestre(user);
                initSystemVendedor(user, sellerData, true);
            } else if (isSeller) {
                initSystemVendedor(user, sellerData, false);
            }
        } else {
            updateUserUI(null, null, false, false);
        }
    });

    // --- Ações de Login/Logout ---
    googleLoginBtn.addEventListener('click', async () => {
        showLoading();
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            await auth.signInWithPopup(provider);
            closePanel();
            showToast('Login com Google bem-sucedido!', 'success');
        } catch (error) {
            console.error("Erro no login com Google:", error.message);
            showToast('Falha no login com Google.', 'error');
        } finally {
            hideLoading();
        }
    });

    emailLoginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        showLoading();
        const email = document.getElementById('panel-login-email').value;
        const password = document.getElementById('panel-login-password').value;
        try {
            await auth.signInWithEmailAndPassword(email, password);
            closePanel();
            showToast('Login bem-sucedido!', 'success');
        } catch (error) {
            console.error("Erro no login com e-mail/senha:", error);
            showToast('Falha no login. Verifique seu e-mail e senha.', 'error');
        } finally {
            hideLoading();
        }
    });

    logoutBtn.addEventListener('click', async () => {
        showLoading();
        try {
            await auth.signOut();
            closePanel();
            showToast('Você foi desconectado.', 'info');
        } catch (error) {
            console.error("Erro ao fazer logout:", error.message);
            showToast('Erro ao desconectar.', 'error');
        } finally {
            hideLoading();
        }
    });

    // --- LÓGICA DE REGISTRO ---
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        showLoading();

        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const phone = document.getElementById('register-phone').value;

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            await user.updateProfile({ displayName: name });
            await firestore.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                phone: phone,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            registerForm.reset();
            registerModal.classList.add('hidden');
            showToast(`Bem-vindo(a), ${name}! Conta criada com sucesso.`, 'success');
        } catch (error) {
            console.error("Erro ao criar conta:", error);
            if (error.code === 'auth/email-already-in-use') {
                showToast('Este e-mail já está cadastrado.', 'error');
            } else if (error.code === 'auth/weak-password') {
                showToast('A senha é muito fraca (mínimo 6 caracteres).', 'error');
            } else {
                showToast('Ocorreu um erro ao criar sua conta.', 'error');
            }
        } finally {
            hideLoading();
        }
    });
}
