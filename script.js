// ============================================================
// GITHUB JUEGOS - SOLO JUEGOS LOCALES (CON FAVICON REAL)
// ============================================================

// ============================================================
// CONFIGURACIÓN - SOLO LISTA ESTÁTICA
// ============================================================

// Obtener juegos de APP_CONFIG o usar fallback
let JUEGOS = [];
let DEFAULT_ROOM_CODE = 'GRIL';

try {
    if (window.APP_CONFIG && window.APP_CONFIG.JUEGOS) {
        JUEGOS = window.APP_CONFIG.JUEGOS;
        DEFAULT_ROOM_CODE = window.APP_CONFIG.DEFAULT_ROOM_CODE || 'GRIL';
        console.log('✅ JUEGOS cargados desde APP_CONFIG:', JUEGOS.length);
    } else {
        console.warn('⚠️ APP_CONFIG no encontrado, usando fallback...');
        JUEGOS = [
            {
                id: 'CleverDados',
                nombre: 'CleverDados',
                ruta: './CleverDados/index.html',
                color: '#D44D5C',
                topics: ['multijugador', 'dados', 'estrategia'],
                badge: 'Online'
            }
        ];
    }
} catch (e) {
    console.error('❌ Error cargando JUEGOS:', e);
    JUEGOS = [];
}

console.log('📋 JUEGOS disponibles:', JUEGOS.length);

// DOM Elements
const projectsContainer = document.getElementById('projectsContainer');
const filterHeader = document.getElementById('filterHeader');
const filterDropdown = document.getElementById('filterDropdown');
const filterTopicsContainer = document.getElementById('filterTopicsContainer');

// ============================================================
// LOBBY - DATOS DEL JUGADOR
// ============================================================

const playerNameInput = document.getElementById('playerNameInput');
const roomCodeInput = document.getElementById('roomCodeInput');
const saveLobbyBtn = document.getElementById('saveLobbyDataBtn');
const clearLobbyBtn = document.getElementById('clearLobbyDataBtn');
const lobbyStatus = document.getElementById('lobbyStatus');

let lobbyData = {
    nombre: '',
    codigoSala: DEFAULT_ROOM_CODE
};

// ============================================================
// CARGAR DATOS GUARDADOS
// ============================================================

function cargarDatosLobby() {
    try {
        const saved = localStorage.getItem('githubjuegos_lobby_data');
        if (saved) {
            const data = JSON.parse(saved);
            lobbyData.nombre = data.nombre || '';
            lobbyData.codigoSala = data.codigoSala || DEFAULT_ROOM_CODE;
            
            if (playerNameInput) playerNameInput.value = lobbyData.nombre;
            if (roomCodeInput) roomCodeInput.value = lobbyData.codigoSala.toUpperCase();
            
            actualizarEstadoLobby();
        }
    } catch (e) {
        console.warn('Error al cargar datos del lobby:', e);
    }
}

// ============================================================
// GUARDAR DATOS DEL LOBBY
// ============================================================

function guardarDatosLobby() {
    const nombre = playerNameInput?.value?.trim() || '';
    const codigoSala = roomCodeInput?.value?.trim()?.toUpperCase() || DEFAULT_ROOM_CODE;
    
    const codigoValido = codigoSala.length >= 4 && /^[A-Z0-9]+$/.test(codigoSala);
    
    if (!nombre) {
        mostrarEstadoLobby('Por favor, ingresa tu nombre', 'error');
        return false;
    }
    
    if (!codigoValido) {
        mostrarEstadoLobby('El código debe tener al menos 4 letras/números', 'error');
        return false;
    }
    
    lobbyData.nombre = nombre;
    lobbyData.codigoSala = codigoSala;
    
    try {
        localStorage.setItem('githubjuegos_lobby_data', JSON.stringify(lobbyData));
        mostrarEstadoLobby(`Datos guardados: ${nombre} | Sala: ${codigoSala}`, 'success');
        actualizarEstadoLobby();
        closeDropdown();
        return true;
    } catch (e) {
        mostrarEstadoLobby('Error al guardar los datos', 'error');
        return false;
    }
}

// ============================================================
// LIMPIAR DATOS DEL LOBBY
// ============================================================

function limpiarDatosLobby() {
    try {
        localStorage.removeItem('githubjuegos_lobby_data');
        lobbyData.nombre = '';
        lobbyData.codigoSala = DEFAULT_ROOM_CODE;
        if (playerNameInput) playerNameInput.value = '';
        if (roomCodeInput) roomCodeInput.value = DEFAULT_ROOM_CODE;
        mostrarEstadoLobby('Datos eliminados', 'info');
        actualizarEstadoLobby();
        return true;
    } catch (e) {
        mostrarEstadoLobby('Error al limpiar', 'error');
        return false;
    }
}

// ============================================================
// MOSTRAR ESTADO DEL LOBBY
// ============================================================

function mostrarEstadoLobby(mensaje, tipo = 'info') {
    if (!lobbyStatus) return;
    lobbyStatus.style.display = 'block';
    lobbyStatus.textContent = mensaje;
    lobbyStatus.className = 'lobby-status ' + tipo;
    
    clearTimeout(lobbyStatus._timeout);
    lobbyStatus._timeout = setTimeout(() => {
        lobbyStatus.style.display = 'none';
    }, 4000);
}

function actualizarEstadoLobby() {
    const syncIndicator = document.getElementById('syncIndicator');
    if (syncIndicator) {
        if (lobbyData.nombre && lobbyData.codigoSala) {
            syncIndicator.textContent = `${lobbyData.nombre} | ${lobbyData.codigoSala}`;
            syncIndicator.classList.add('active');
        } else {
            syncIndicator.textContent = '';
            syncIndicator.classList.remove('active');
        }
    }
}

// ============================================================
// ABRIR JUEGO CON DATOS DEL LOBBY
// ============================================================

function openGame(gameId) {
    console.log('🎮 Abriendo juego:', gameId);
    
    const juego = JUEGOS.find(j => j.id === gameId);
    if (!juego) {
        console.error('❌ Juego no encontrado:', gameId);
        alert('Juego no encontrado: ' + gameId);
        return;
    }
    
    console.log('✅ Juego encontrado:', juego);
    let url = juego.ruta;
    
    // Si es CleverDados, pasar parámetros
    if (gameId === 'CleverDados') {
        const nombre = lobbyData.nombre || 'Jugador';
        const codigo = lobbyData.codigoSala || DEFAULT_ROOM_CODE;
        
        const separator = url.includes('?') ? '&' : '?';
        const finalUrl = url + separator + `nombre=${encodeURIComponent(nombre)}&sala=${codigo}`;
        console.log('🚀 Abriendo CleverDados con:', finalUrl);
        window.open(finalUrl, '_blank');
        return;
    }
    
    // Para otros juegos, abrir normalmente
    console.log('🚀 Abriendo:', url);
    window.open(url, '_blank');
}

// ============================================================
// ESTADO GLOBAL
// ============================================================

let allGames = [];
let currentFilter = null;
let allTopics = new Set();
let isDropdownOpen = false;

// ============================================================
// RENDERIZADO DE JUEGOS - CON FAVICON REAL
// ============================================================

function renderGamesHTML(games) {
    let html = '';
    if (games.length === 0) {
        return `
            <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #E3B5A4;">
                <p style="font-size: 1.2rem;">No hay juegos en la carpeta</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem; color: #888;">
                    Añade juegos en <strong>APP_CONFIG.JUEGOS</strong>
                </p>
            </div>
        `;
    }
    for (const juego of games) {
        const color = juego.color || '#666';
        const badge = juego.badge ? `<span class="project-badge">${juego.badge}</span>` : '';
        const esClever = juego.id === 'CleverDados';
        const claseExtra = esClever ? 'project-clever' : '';
        
        // Construir ruta base del juego
        const rutaBase = juego.ruta.substring(0, juego.ruta.lastIndexOf('/') + 1);
        const faviconPath = rutaBase + 'favicon.ico';
        const faviconPngPath = rutaBase + 'favicon.png';
        
        html += `
            <div class="project-item ${claseExtra}" data-game="${juego.id}" onclick="openGame('${juego.id}')">
                <div class="favicon-wrapper" style="background: ${color}22; border-color: ${color}44;">
                    <img 
                        src="${faviconPath}" 
                        alt="${juego.nombre}" 
                        class="favicon-img"
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                        loading="lazy"
                    />
                    <div class="favicon-placeholder" style="background: ${color}; font-size: 2rem; display: none;">
                        ${juego.nombre.charAt(0)}
                    </div>
                </div>
                <div class="project-name">
                    <a href="#" onclick="event.preventDefault(); openGame('${juego.id}')">${juego.nombre}</a>
                    ${badge}
                </div>
            </div>
        `;
    }
    return html;
}

function renderGames(games) {
    allGames = games;
    allTopics = new Set();
    games.forEach(juego => {
        (juego.topics || []).forEach(topic => allTopics.add(topic));
    });
    projectsContainer.innerHTML = renderGamesHTML(games);
    Animations.enter(document.querySelectorAll('.project-item'));
}

// ============================================================
// FILTRADO POR TEMA
// ============================================================

function filterGamesByTopic(topic) {
    if (currentFilter === topic) {
        currentFilter = null;
        document.querySelectorAll('.filter-topic-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        Animations.filterAndAnimate(
            projectsContainer,
            allGames,
            () => {
                projectsContainer.innerHTML = renderGamesHTML(allGames);
            }
        );
        closeDropdown();
        return;
    }

    currentFilter = topic;
    document.querySelectorAll('.filter-topic-btn').forEach(btn => {
        const btnTopic = btn.dataset.topic;
        if (btnTopic === topic) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    const filtered = allGames.filter(juego =>
        (juego.topics || []).includes(topic)
    );
    Animations.filterAndAnimate(
        projectsContainer,
        filtered,
        () => {
            projectsContainer.innerHTML = renderGamesHTML(filtered);
        }
    );
    closeDropdown();
}

// ============================================================
// DROPDOWN
// ============================================================

function toggleDropdown() {
    if (isDropdownOpen) {
        closeDropdown();
    } else {
        openDropdown();
    }
}

function openDropdown() {
    const topicsArray = Array.from(allTopics).sort();
    if (topicsArray.length === 0) {
        filterTopicsContainer.innerHTML = `
            <p style="color: #E3B5A4; text-align: center; padding: 1rem; width: 100%;">
                No hay temas disponibles
            </p>
        `;
    } else {
        filterTopicsContainer.innerHTML = topicsArray.map(topic => `
            <button class="filter-topic-btn ${currentFilter === topic ? 'active' : ''}"
                    data-topic="${topic}"
                    onclick="filterGamesByTopic('${topic}')">
                #${capitalize(topic)}
                <span class="topic-count">${allGames.filter(juego => (juego.topics || []).includes(topic)).length}</span>
            </button>
        `).join('');
    }
    Animations.openDropdown(filterDropdown);
    isDropdownOpen = true;
}

function closeDropdown() {
    if (!isDropdownOpen) return;
    Animations.closeDropdown(filterDropdown, () => {
        isDropdownOpen = false;
    });
}

// ============================================================
// UTILIDADES
// ============================================================

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================
// EVENT LISTENERS
// ============================================================

filterHeader.addEventListener('click', toggleDropdown);

if (saveLobbyBtn) {
    saveLobbyBtn.addEventListener('click', guardarDatosLobby);
}

if (clearLobbyBtn) {
    clearLobbyBtn.addEventListener('click', limpiarDatosLobby);
}

if (playerNameInput) {
    playerNameInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') guardarDatosLobby();
    });
}
if (roomCodeInput) {
    roomCodeInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') guardarDatosLobby();
    });
}

document.addEventListener('click', function(event) {
    if (isDropdownOpen) {
        const target = event.target;
        const isHeader = filterHeader.contains(target);
        const isDropdown = filterDropdown.contains(target);
        if (!isHeader && !isDropdown) {
            closeDropdown();
        }
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && isDropdownOpen) {
        closeDropdown();
    }
});

// ============================================================
// QR MODAL
// ============================================================

const qrModal = document.getElementById('qrModal');
const qrButton = document.getElementById('qrButton');

if (qrButton) {
    qrButton.addEventListener('click', function() {
        Animations.openModal(qrModal);
    });
}

if (qrModal) {
    qrModal.addEventListener('click', function(event) {
        if (event.target === qrModal) {
            Animations.closeModal(qrModal);
        }
    });
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && qrModal && qrModal.classList.contains('show')) {
        Animations.closeModal(qrModal);
    }
});

// ============================================================
// INICIALIZAR - SOLO JUEGOS LOCALES
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando Github Juegos (SOLO LOCAL)...');
    console.log('📋 JUEGOS configurados:', JUEGOS);
    
    cargarDatosLobby();
    
    if (!JUEGOS || JUEGOS.length === 0) {
        console.warn('⚠️ No hay juegos configurados');
        projectsContainer.innerHTML = `
            <div class="error" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <p style="font-size: 1.2rem; color: #E3B5A4;">No hay juegos en la carpeta</p>
                <p style="font-size: 0.8rem; margin-top: 0.5rem; color: #888;">
                    Añade juegos en <strong>APP_CONFIG.JUEGOS</strong> dentro de index.html
                </p>
                <p style="font-size: 0.7rem; margin-top: 0.5rem; color: #666;">
                    Ejemplo: { id: 'MiJuego', nombre: 'Mi Juego', ruta: './MiJuego/index.html', color: '#D44D5C', topics: ['accion'] }
                </p>
            </div>
        `;
        return;
    }
    
    console.log('✅ Renderizando', JUEGOS.length, 'juegos locales');
    renderGames(JUEGOS);
});

// ============================================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================================

window.filterGamesByTopic = filterGamesByTopic;
window.capitalize = capitalize;
window.openGame = openGame;
window.guardarDatosLobby = guardarDatosLobby;
window.limpiarDatosLobby = limpiarDatosLobby;