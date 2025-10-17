// js/auth.js (VERSÃO COM REGISTRO DE USUÁRIO)

import { auth, firestore } from './app.js';
import { initSystemVendedor } from './systemvendedor.js';
import { initSystemMestre } from './systemmestre.js';

// ... (toda a seleção de elementos e funções updateUserUI, openPanel, closePanel continuam as mesmas)

export function initAuth() {
    // ... (toda a seleção de elementos no início da função continua a mesma)
    const registerForm = document.getElementById('register-form');
    const registerModal = document.getElementById('register-modal');

    // ... (toda a lógica de abrir/fechar painel e botões de login/logout continua a mesma)

    // ==========================================================
    // --- NOVA LÓGICA PARA O FORMULÁRIO DE REGISTRO ---
    // ==========================================================
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const phone = document.getElementById('register-phone').value;

        try {
            // 1. Cria o usuário no Firebase Authentication
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // 2. Adiciona o nome do usuário ao perfil de autenticação
            await user.updateProfile({
                displayName: name
            });

            // 3. Salva as informações adicionais em uma coleção 'users' no Firestore
            await firestore.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                phone: phone,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // 4. Feedback e fecha o modal
            registerForm.reset();
            registerModal.classList.add('hidden');
            alert(`Bem-vindo(a), ${name}! Sua conta foi criada com sucesso.`);

        } catch (error) {
            console.error("Erro ao criar conta:", error);
            // Mensagens de erro mais amigáveis para o usuário
            if (error.code === 'auth/email-already-in-use') {
                alert('Este e-mail já está cadastrado. Tente fazer login.');
            } else if (error.code === 'auth/weak-password') {
                alert('A senha é muito fraca. Ela deve ter no mínimo 6 caracteres.');
            } else {
                alert('Ocorreu um erro ao criar sua conta. Tente novamente.');
            }
        }
    });
}

// ... (o resto do arquivo, como a função onAuthStateChanged e os listeners de login/logout, continua o mesmo)


// PARA FACILITAR, COLE O CÓDIGO 100% COMPLETO ABAIXO NO SEU auth.js
// =======================================================================
// CÓDIGO COMPLETO PARA COPIAR
// =======================================================================
import { auth, firestore } from './app.js';
import { initSystemVendedor } from './systemvendedor.js';
import { initSystemMestre } from './systemmestre.js';

let openMenuBtn, closeMenuBtn, sidePanel, panelOverlay, loggedOutView, loggedInView;
let googleLoginBtn, emailLoginForm, logoutBtn, userDisplayName, goToDashboardBtn;
let sellerDashboardModal;

function updateUserUI(user, sellerData, isSeller, isAdmin) { if (user) { loggedOutView.classList.add('hidden'); loggedInView.classList.remove('hidden'); userDisplayName.textContent = sellerData?.name || user.displayName || 'Usuário'; if (isSeller || isAdmin) { goToDashboardBtn.classList.remove('hidden'); } else { goToDashboardBtn.classList.add('hidden'); } } else { loggedOutView.classList.remove('hidden'); loggedInView.classList.add('hidden'); userDisplayName.textContent = ''; goToDashboardBtn.classList.add('hidden'); } }

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
    const registerForm = document.getElementById('register-form');
    const registerModal = document.getElementById('register-modal');

    const openPanel = () => sidePanel.classList.add('is-open');
    const closePanel = () => sidePanel.classList.remove('is-open');

    openMenuBtn.addEventListener('click', openPanel);
    closeMenuBtn.addEventListener('click', closePanel);
    panelOverlay.addEventListener('click', closePanel);

    goToDashboardBtn.addEventListener('click', (event) => { event.preventDefault(); closePanel(); setTimeout(() => { sellerDashboardModal.classList.remove('hidden'); }, 300); });

    auth.onAuthStateChanged(async user => {
        if (user) {
            const adminDoc = await firestore.collection('admins').doc(user.uid).get();
            const sellerDoc = await firestore.collection('sellers').doc(user.uid).get();
            const isAdmin = adminDoc.exists;
            const isSeller = sellerDoc.exists;
            const sellerData = isSeller ? sellerDoc.data() : null;
            updateUserUI(user, sellerData, isSeller, isAdmin);
            if (isAdmin) { initSystemMestre(user); initSystemVendedor(user, sellerData, true); } 
            else if (isSeller) { initSystemVendedor(user, sellerData, false); }
        } else {
            updateUserUI(null, null, false, false);
        }
    });

    googleLoginBtn.addEventListener('click', async () => { const provider = new firebase.auth.GoogleAuthProvider(); try { await auth.signInWithPopup(provider); closePanel(); } catch (error) { console.error("Erro no login com Google:", error.message); } });
    emailLoginForm.addEventListener('submit', async (event) => { event.preventDefault(); const email = document.getElementById('panel-login-email').value; const password = document.getElementById('panel-login-password').value; try { await auth.signInWithEmailAndPassword(email, password); closePanel(); } catch (error) { console.error("Erro no login com e-mail/senha:", error); alert("Falha no login. Verifique seu e-mail e senha."); } });
    logoutBtn.addEventListener('click', async () => { try { await auth.signOut(); closePanel(); } catch (error) { console.error("Erro ao fazer logout:", error.message); } });
    
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const phone = document.getElementById('register-phone').value;
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            await user.updateProfile({ displayName: name });
            await firestore.collection('users').doc(user.uid).set({ name: name, email: email, phone: phone, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
            registerForm.reset();
            registerModal.classList.add('hidden');
            alert(`Bem-vindo(a), ${name}! Sua conta foi criada com sucesso.`);
        } catch (error) {
            console.error("Erro ao criar conta:", error);
            if (error.code === 'auth/email-already-in-use') {
                alert('Este e-mail já está cadastrado. Tente fazer login.');
            } else if (error.code === 'auth/weak-password') {
                alert('A senha é muito fraca. Ela deve ter no mínimo 6 caracteres.');
            } else {
                alert('Ocorreu um erro ao criar sua conta. Tente novamente.');
            }
        }
    });
}
