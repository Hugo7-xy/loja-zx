// js/channels.js

// Seleciona os containers vazios no HTML
const mainChannelsContainer = document.querySelector('#channels-page .main-channels');
const accordionContainer = document.querySelector('#channels-page .accordion');

/**
 * Renderiza os botões principais (Telegram, Discord).
 * @param {Array} channels - O array de canais principais do JSON.
 */
function renderMainChannels(channels) {
    let html = '';
    channels.forEach(channel => {
        html += `
            <a href="${channel.url}" target="_blank" class="channel-button ${channel.class}">
                <i class="${channel.icon}"></i> ${channel.name}
            </a>
        `;
    });
    mainChannelsContainer.innerHTML = html;
}

/**
 * Renderiza o acordeão de grupos de WhatsApp.
 * @param {Array} franchises - O array de franquias do JSON.
 */
function renderWhatsappAccordion(franchises) {
    let html = '';
    franchises.forEach(franchise => {
        // Cria a grade de links para os grupos desta franquia
        let groupsGrid = '';
        franchise.groups.forEach(group => {
            groupsGrid += `<a href="${group.url}" target="_blank" class="whatsapp-link">${group.name}</a>`;
        });

        // Monta o item completo do acordeão
        html += `
            <div class="accordion-item">
                <button class="accordion-header">${franchise.name}</button>
                <div class="accordion-content">
                    <div class="whatsapp-grid">
                        ${groupsGrid}
                    </div>
                </div>
            </div>
        `;
    });
    accordionContainer.innerHTML = html;
}

/**
 * Função principal que busca os dados do JSON e inicia a renderização.
 */
export async function initChannels() {
    try {
        // Busca o arquivo JSON. O caminho é relativo à raiz do site.
        const response = await fetch('/data/channels.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Chama as funções para construir o HTML
        renderMainChannels(data.mainChannels);
        renderWhatsappAccordion(data.whatsappFranchises);
        
        console.log("Módulo de Canais inicializado e renderizado.");

    } catch (error) {
        console.error("Não foi possível carregar os dados dos canais:", error);
        accordionContainer.innerHTML = "<p>Erro ao carregar a lista de canais.</p>";
    }
}