// js/systemmestre.js

import { auth, firestore } from './app.js';
// Importa a função de renderizar produtos do módulo de vendedor para ser reutilizada.
import { renderSellerProducts } from './systemvendedor.js'; 

/**
 * Busca todos os vendedores no Firestore e os exibe na lista do painel de admin.
 */
async function loadAndDisplaySellers() {
    const adminSellerList = document.getElementById('admin-seller-list');
    if (!adminSellerList) return;
    adminSellerList.innerHTML = '<p>Carregando vendedores...</p>';
    
    try {
        const snapshot = await firestore.collection('sellers').get();
        if (snapshot.empty) {
            adminSellerList.innerHTML = '<p>Nenhum vendedor cadastrado no momento.</p>';
            return;
        }

        let sellersHTML = '';
        snapshot.forEach(doc => {
            const seller = doc.data();
            sellersHTML += `
    <div class="vendor-product-item">
        <div class="vendor-info">
            <span class="vendor-name">${seller.name}</span>
            <span class="vendor-email">${seller.email || 'sem e-mail'}</span>
        </div>
        <div class="actions">
            <button class="action-btn admin-manage-btn" data-uid="${doc.id}" data-name="${seller.name}">Gerenciar</button>
            <button class="action-btn delete-btn admin-delete-seller" data-uid="${doc.id}" data-name="${seller.name}">Remover</button>
        </div>
    </div>
`;
        });
        adminSellerList.innerHTML = sellersHTML;

    } catch (error) {
        console.error("Erro ao carregar lista de vendedores:", error);
        adminSellerList.innerHTML = '<p>Falha ao carregar vendedores. Verifique as permissões de admin nas regras do Firestore.</p>';
    }
}

/**
 * Configura os eventos de clique para a lista de vendedores (gerenciar e remover).
 */
function setupAdminEventListeners() {
    const adminSellerList = document.getElementById('admin-seller-list');
    if (!adminSellerList) return;

    adminSellerList.addEventListener('click', async (event) => {
        const target = event.target;
        const sellerUid = target.dataset.uid;
        const sellerName = target.dataset.name;

        // Lógica para o botão "Remover"
        if (target.classList.contains('admin-delete-seller')) {
            if (confirm(`Tem certeza que deseja remover o vendedor "${sellerName}"? Seus produtos permanecerão, mas o acesso será revogado. Esta ação não pode ser desfeita.`)) {
                try {
                    await firestore.collection('sellers').doc(sellerUid).delete();
                    alert(`Vendedor "${sellerName}" removido com sucesso.`);
                    loadAndDisplaySellers(); // Recarrega a lista
                } catch (error) {
                    console.error("Erro ao remover vendedor:", error);
                    alert("Falha ao remover vendedor.");
                }
            }
        }

        // Lógica para o botão "Gerenciar Produtos"
        if (target.classList.contains('admin-manage-btn')) {
            // Troca para a aba de produtos
            const productTabButton = document.querySelector('[data-target="panel-products"]');
            if (productTabButton) {
                productTabButton.click();
            }
            // Renderiza os produtos do vendedor selecionado, na visão de admin
            renderSellerProducts(sellerUid, true); 
        }
    });
}

/**
 * Função principal que será exportada e chamada pelo auth.js.
 */
export function initSystemMestre(user) {
    const adminTab = document.getElementById('admin-tab-button');
    if (!adminTab) return;

    // Mostra a aba de Admin no menu do painel
    adminTab.classList.remove('hidden');
    
    // Por padrão, clica na aba de admin para mostrá-la primeiro
    const adminTabButton = adminTab.querySelector('button');
    if (adminTabButton) {
        adminTabButton.click();
    }
    
    loadAndDisplaySellers();
    setupAdminEventListeners();
}

