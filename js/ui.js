// js/ui.js

const loadingOverlay = document.getElementById('loading-overlay');
const toastContainer = document.getElementById('toast-container');

/**
 * Mostra a tela de carregamento.
 */
export function showLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
}

/**
 * Esconde a tela de carregamento.
 */
export function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

/**
 * Exibe uma notificação (toast) na tela.
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} [type='info'] - O tipo de toast ('success', 'error', ou 'info').
 */
export function showToast(message, type = 'info') {
    if (!toastContainer) return;

    // Cria o elemento do toast
    const toast = document.createElement('div');
    toast.classList.add('toast', `toast-${type}`);
    toast.textContent = message;

    // Adiciona o toast ao container
    toastContainer.appendChild(toast);

    // Remove o toast após a animação de saída terminar (3.5 segundos)
    setTimeout(() => {
        toast.remove();
    }, 3500);
}
