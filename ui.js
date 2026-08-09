// Sistema de UI y renderizado
const UI = {
    elements: {},
    
    init() {
        this.elements = {
            projectsContainer: document.getElementById('projectsContainer'),
            filterHeader: document.getElementById('filterHeader'),
            filterDropdown: document.getElementById('filterDropdown'),
            filterTopicsContainer: document.getElementById('filterTopicsContainer'),
            syncIndicator: document.getElementById('syncIndicator'),
            playerNameInput: document.getElementById('playerNameInput'),
            roomCodeInput: document.getElementById('roomCodeInput'),
            saveLobbyBtn: document.getElementById('saveLobbyDataBtn'),
            clearLobbyBtn: document.getElementById('clearLobbyDataBtn'),
            lobbyStatus: document.getElementById('lobbyStatus'),
            qrModal: document.getElementById('qrModal'),
            qrButton: document.getElementById('qrButton')
        };
    },
    
    renderGames(juegos) {
        const container = this.elements.projectsContainer;
        if (!juegos || juegos.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            return;
        }
        
        container.innerHTML = juegos.map(function(juego) {
            return UI.getGameCardHTML(juego);
        }).join('');
        Animations.enter(container.querySelectorAll('.project-item'));
    },
    
    getGameCardHTML(juego) {
        const color = juego.color || '#666';
        const rutaBase = juego.ruta.substring(0, juego.ruta.lastIndexOf('/') + 1);
        const faviconPath = rutaBase + 'favicon.ico';
        
        return `
            <div class="project-item" data-game="${juego.id}" onclick="window.openGame('${juego.id}')">
                <div class="favicon-wrapper" style="background: ${color}22; border-color: ${color}44;">
                    <img 
                        src="${faviconPath}" 
                        alt="${juego.nombre}" 
                        class="favicon-img"
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                        loading="lazy"
                    />
                    <div class="favicon-placeholder" style="background: ${color}; display: none;">
                        ${juego.nombre.charAt(0)}
                    </div>
                </div>
                <div class="project-name">${juego.nombre}</div>
            </div>
        `;
    },
    
    getEmptyStateHTML() {
        return `
            <div class="no-results">
                <p>No hay juegos disponibles</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem; color: #888;">
                    Anade juegos en APP_CONFIG.JUEGOS
                </p>
            </div>
        `;
    },
    
    renderFilterTopics(juegos) {
        const container = this.elements.filterTopicsContainer;
        const topics = FilterSystem.getTopicsArray();
        
        container.innerHTML = topics.map(function(topic) {
            const count = FilterHelpers.getTopicCount(juegos, topic);
            const active = FilterSystem.isActive(topic) ? 'active' : '';
            return `
                <button class="filter-topic-btn ${active}"
                        data-topic="${topic}"
                        onclick="window.filterGamesByTopic('${topic}')">
                    #${FilterHelpers.capitalize(topic)}
                    <span class="topic-count">${count}</span>
                </button>
            `;
        }).join('');
    },
    
    updateSyncIndicator(playerName, roomCode) {
        const indicator = this.elements.syncIndicator;
        if (playerName && roomCode) {
            indicator.textContent = playerName + ' | ' + roomCode;
            indicator.classList.add('active');
        } else {
            indicator.textContent = '';
            indicator.classList.remove('active');
        }
    },
    
    showLobbyStatus(message, type) {
        type = type || 'info';
        const status = this.elements.lobbyStatus;
        status.style.display = 'block';
        status.textContent = message;
        status.className = 'lobby-status ' + type;
        
        clearTimeout(status._timeout);
        status._timeout = setTimeout(function() {
            status.style.display = 'none';
        }, 4000);
    },
    
    setPlayerData(nombre, codigoSala) {
        if (this.elements.playerNameInput) {
            this.elements.playerNameInput.value = nombre;
        }
        if (this.elements.roomCodeInput) {
            this.elements.roomCodeInput.value = codigoSala;
        }
    },
    
    toggleDropdown(open) {
        const dropdown = this.elements.filterDropdown;
        if (open) {
            Animations.openDropdown(dropdown);
        } else {
            Animations.closeDropdown(dropdown);
        }
    },
    
    openQRModal() {
        Animations.openModal(this.elements.qrModal);
    },
    
    closeQRModal() {
        Animations.closeModal(this.elements.qrModal);
    }
};