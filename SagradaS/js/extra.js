// ===== EXTRA.JS =====
// Sistema de colores aleatorios para jugadores (solo visible para cada jugador)

// ============================================================
// ESTADO DE COLORES
// ============================================================

const COLORES_DISPONIBLES = [
    { id: 'yellow', nombre: 'Amarillo', hex: '#F1B215', clase: 'color-yellow' },
    { id: 'green', nombre: 'Verde', hex: '#437F3F', clase: 'color-green' },
    { id: 'blue', nombre: 'Azul', hex: '#057599', clase: 'color-blue' },
    { id: 'purple', nombre: 'Morado', hex: '#5D4080', clase: 'color-purple' },
    { id: 'red', nombre: 'Rojo', hex: '#940219', clase: 'color-red' }
];

let coloresState = {
    // Mapa de jugadorId -> color asignado
    asignaciones: {}, // { jugadorId: 'yellow', ... }
    // Colores ya asignados (para no repetir)
    coloresUsados: [], // ['yellow', 'green', ...]
    // Mi color asignado
    miColor: null, // 'yellow' | null
    // Flag para saber si ya se asignaron colores
    coloresAsignados: false,
    // Visibilidad de los bordes del objetivo privado
    mostrarBordesObjetivo: true // Por defecto activado
};

// ============================================================
// FUNCIONES PARA TOGGLE DE BORDES
// ============================================================

/**
 * Alterna la visibilidad de los bordes del objetivo privado
 * @returns {boolean} - Nuevo estado de visibilidad
 */
function toggleBordesObjetivo() {
    coloresState.mostrarBordesObjetivo = !coloresState.mostrarBordesObjetivo;
    
    // Re-renderizar el tablero para aplicar el cambio
    if (typeof renderBoard === 'function') {
        renderBoard();
    }
    
    // Mostrar mensaje temporal
    const estado = coloresState.mostrarBordesObjetivo ? 'activada' : 'desactivada';
    showTemporaryMessage(`🔲 Visibilidad de objetivo privado ${estado}`, 1500);
    
    return coloresState.mostrarBordesObjetivo;
}

/**
 * Obtiene el estado de visibilidad de los bordes del objetivo privado
 * @returns {boolean} - true si los bordes están visibles
 */
function getMostrarBordesObjetivo() {
    return coloresState.mostrarBordesObjetivo;
}

// ============================================================
// ASIGNAR COLORES A JUGADORES
// ============================================================

/**
 * Asigna un color aleatorio a cada jugador en la sala
 * Se llama cuando se presiona "Vitrinas" (repartir cartillas)
 * @returns {object} - Las asignaciones realizadas
 */
function asignarColoresAJugadores() {
    if (coloresState.coloresAsignados) {
        console.log('⚠️ Los colores ya fueron asignados');
        return coloresState.asignaciones;
    }

    const playerIds = Object.keys(window.playersData || {});
    if (playerIds.length === 0) {
        console.warn('⚠️ No hay jugadores para asignar colores');
        return {};
    }

    // Mezclar colores disponibles
    const coloresMezclados = [...COLORES_DISPONIBLES];
    for (let i = coloresMezclados.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [coloresMezclados[i], coloresMezclados[j]] = [coloresMezclados[j], coloresMezclados[i]];
    }

    // Asignar un color a cada jugador (si hay más jugadores que colores, se repiten)
    const asignaciones = {};
    const coloresUsados = [];
    
    playerIds.forEach((playerId, index) => {
        // Si hay más jugadores que colores, usar el mismo color
        const colorIdx = index % coloresMezclados.length;
        const color = coloresMezclados[colorIdx];
        asignaciones[playerId] = color.id;
        if (!coloresUsados.includes(color.id)) {
            coloresUsados.push(color.id);
        }
    });

    coloresState.asignaciones = asignaciones;
    coloresState.coloresUsados = coloresUsados;
    coloresState.coloresAsignados = true;

    // Guardar mi color
    if (window.myId && asignaciones[window.myId]) {
        coloresState.miColor = asignaciones[window.myId];
        console.log(`🎨 Tu color asignado: ${getNombreColor(coloresState.miColor)}`);
    }

    console.log('🎨 Colores asignados:', asignaciones);
    
    // Actualizar UI de favores para mostrar el color
    renderFavoresConColor();
    
    // También actualizar el leaderboard para mostrar los colores
    if (typeof renderLeaderboard === 'function') {
        renderLeaderboard();
    }
    
    return asignaciones;
}

/**
 * Obtiene el color asignado a un jugador
 * @param {string} playerId - ID del jugador
 * @returns {string|null} - ID del color o null si no tiene
 */
function getColorDeJugador(playerId) {
    return coloresState.asignaciones[playerId] || null;
}

/**
 * Obtiene el color del jugador local
 * @returns {string|null} - ID del color o null si no tiene
 */
function getMiColor() {
    return coloresState.miColor;
}

/**
 * Obtiene la información completa de un color por su ID
 * @param {string} colorId - 'yellow', 'green', 'blue', 'purple', 'red'
 * @returns {object|null} - Objeto con nombre, hex, clase
 */
function getColorInfo(colorId) {
    return COLORES_DISPONIBLES.find(c => c.id === colorId) || null;
}

/**
 * Obtiene el nombre legible de un color
 * @param {string} colorId - ID del color
 * @returns {string} - Nombre del color o 'Desconocido'
 */
function getNombreColor(colorId) {
    const info = getColorInfo(colorId);
    return info ? info.nombre : 'Desconocido';
}

/**
 * Obtiene la clase CSS de un color
 * @param {string} colorId - ID del color
 * @returns {string} - Clase CSS o ''
 */
function getClaseColor(colorId) {
    const info = getColorInfo(colorId);
    return info ? info.clase : '';
}

/**
 * Obtiene el color HEX de un color
 * @param {string} colorId - ID del color
 * @returns {string} - Código HEX o '#ffffff'
 */
function getHexColor(colorId) {
    const info = getColorInfo(colorId);
    return info ? info.hex : '#ffffff';
}

// ============================================================
// UI - RENDER FAVORES CON COLOR (CON TOGGLE)
// ============================================================

/**
 * Renderiza los favores con el color del jugador
 * Sobrescribe la función renderFavoresDisplay de ui.js para incluir el color
 * Ahora también permite hacer clic para toggle de bordes
 */
function renderFavoresConColor() {
    const oldFavores = document.getElementById('favoresDisplay');
    if (oldFavores) oldFavores.remove();
    
    const boardContainer = document.querySelector('.board-container');
    if (!boardContainer) return;
    
    const favoresDiv = document.createElement('div');
    favoresDiv.id = 'favoresDisplay';
    
    const total = herramientasState.favores.total || 0;
    const disponibles = herramientasState.favores.disponibles || 0;
    const gastados = herramientasState.favores.gastados || 0;
    
    if (total === 0) {
        favoresDiv.style.display = 'none';
        boardContainer.appendChild(favoresDiv);
        return;
    }
    
    const miColorId = coloresState.miColor;
    const colorHex = miColorId ? getHexColor(miColorId) : '#fdd835';
    
    // Estado de visibilidad de bordes
    const bordesActivos = coloresState.mostrarBordesObjetivo;
    const borderGlow = bordesActivos ? `0 0 15px ${colorHex}60` : 'none';
    const borderColor = bordesActivos ? colorHex : 'var(--border-color)';
    
    favoresDiv.style.cssText = `
        margin-top: 12px;
        padding: 10px 14px;
        background: var(--bg-box);
        border-radius: 10px;
        border: 2px solid ${borderColor};
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        flex-wrap: wrap;
        transition: all 0.3s ease;
        cursor: pointer;
        box-shadow: ${borderGlow};
        user-select: none;
    `;
    
    // Añadir hover effect
    favoresDiv.addEventListener('mouseenter', () => {
        favoresDiv.style.transform = 'scale(1.02)';
        favoresDiv.style.boxShadow = bordesActivos ? `0 0 25px ${colorHex}80` : '0 0 15px rgba(255,255,255,0.1)';
    });
    favoresDiv.addEventListener('mouseleave', () => {
        favoresDiv.style.transform = 'scale(1)';
        favoresDiv.style.boxShadow = bordesActivos ? `0 0 15px ${colorHex}60` : 'none';
    });
    
    // Click para toggle de bordes
    favoresDiv.addEventListener('click', () => {
        if (typeof toggleBordesObjetivo === 'function') {
            toggleBordesObjetivo();
        }
    });
    
    // Puntos de favores - SOLO PUNTOS, sin texto
    const puntosContainer = document.createElement('div');
    puntosContainer.className = 'favores-puntos';
    puntosContainer.style.cssText = 'display: flex; gap: 6px; align-items: center;';
    
    for (let i = 0; i < total; i++) {
        const punto = document.createElement('span');
        const esGastado = i < gastados;
        punto.textContent = '●';
        punto.className = `favores-punto ${esGastado ? 'gastado' : 'activo'}`;
        punto.style.cssText = `
            font-size: 1.6rem;
            line-height: 1;
            transition: all 0.3s ease;
            display: inline-block;
            color: ${esGastado ? 'var(--text-muted)' : colorHex};
            opacity: ${esGastado ? '0.2' : '1'};
            transform: ${esGastado ? 'scale(0.85)' : 'scale(1)'};
            text-shadow: ${esGastado ? 'none' : `0 0 15px ${colorHex}40`};
        `;
        if (!esGastado) {
            punto.style.animation = 'favor-pulse 2s ease-in-out infinite';
        }
        puntosContainer.appendChild(punto);
    }
    favoresDiv.appendChild(puntosContainer);
    
    boardContainer.appendChild(favoresDiv);
}

// ============================================================
// SINCRONIZACIÓN MULTIJUGADOR
// ============================================================

/**
 * Sincroniza los colores con otros jugadores
 * Envía la asignación de colores a través de MQTT
 */
function sincronizarColores() {
    if (!coloresState.coloresAsignados) {
        console.warn('⚠️ No se pueden sincronizar colores: no están asignados');
        return;
    }
    
    if (window.mqttClient && window.currentRoom) {
        const topic = `sagradas_app/room/${window.currentRoom}`;
        const payload = {
            action: 'colors_sync',
            id: window.myId,
            colores: coloresState.asignaciones,
            coloresUsados: coloresState.coloresUsados,
            isCreator: window.isRoomCreator || false
        };
        window.mqttClient.publish(topic, JSON.stringify(payload));
        console.log('🎨 Colores sincronizados:', coloresState.asignaciones);
    } else {
        console.warn('⚠️ No se pudo sincronizar colores: MQTT no disponible');
    }
}

/**
 * Recibe la sincronización de colores de otro jugador
 * @param {object} data - Datos recibidos por MQTT
 */
function recibirColoresSincronizados(data) {
    if (!data || !data.colores) return;
    
    // Si el emisor es el creador o si nosotros no tenemos colores, actualizar
    const esCreador = data.isCreator === true;
    const tenemosColores = coloresState.coloresAsignados;
    
    if (esCreador || !tenemosColores) {
        coloresState.asignaciones = data.colores;
        coloresState.coloresUsados = data.coloresUsados || [];
        coloresState.coloresAsignados = true;
        
        // Guardar mi color si existe
        if (window.myId && coloresState.asignaciones[window.myId]) {
            coloresState.miColor = coloresState.asignaciones[window.myId];
            console.log(`🎨 Color sincronizado: ${getNombreColor(coloresState.miColor)}`);
            
            // Mostrar mensaje con el color asignado
            const colorNombre = getNombreColor(coloresState.miColor);
            showTemporaryMessage(`🎨 Tu color asignado: ${colorNombre}`, 2500);
        }
        
        // Actualizar UI
        renderFavoresConColor();
        if (typeof renderLeaderboard === 'function') {
            renderLeaderboard();
        }
    }
}

// ============================================================
// INTEGRACIÓN CON EL FLUJO EXISTENTE
// ============================================================

/**
 * Función que se llama al presionar "Vitrinas" (repartir cartillas)
 * Extiende la funcionalidad existente para asignar colores
 */
function iniciarConColores() {
    // Primero asignar colores
    asignarColoresAJugadores();
    
    // Luego sincronizar con otros jugadores
    if (window.isRoomCreator) {
        sincronizarColores();
    }
    
    // Llamar a la función original de repartir cartillas
    if (typeof window.repartirCartillasUnicas === 'function') {
        window.repartirCartillasUnicas();
    }
}

/**
 * Extiende la función de renderFavoresDisplay original
 * para usar la versión con color
 */
function extenderRenderFavores() {
    // Solo sobrescribir si la función original existe
    if (typeof window.renderFavoresDisplay === 'function') {
        // Guardar referencia a la original
        window._renderFavoresOriginal = window.renderFavoresDisplay;
        // Sobrescribir
        window.renderFavoresDisplay = renderFavoresConColor;
    }
}

// ============================================================
// EXTENSIÓN DE MQTT PARA COLORES
// ============================================================

/**
 * Extiende el sistema MQTT para manejar sincronización de colores
 * Debe llamarse desde mqtt.js al procesar mensajes
 */
function extenderMqttParaColores() {
    // Verificar si existe la función original de procesamiento
    const mensajeHandler = window._mqttMessageHandler;
    
    // Esta función se llama desde el handler de mensajes de mqtt.js
    // La integramos en la función existente
    console.log('🎨 Extensión de colores activada para MQTT');
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

function initColores() {
    // Extender renderFavores para usar la versión con color
    extenderRenderFavores();
    
    // Extender la función de reparto de cartillas para incluir colores
    if (typeof window.repartirCartillasUnicas === 'function') {
        const originalRepartir = window.repartirCartillasUnicas;
        window.repartirCartillasUnicas = function() {
            // Si los colores no están asignados, asignarlos
            if (!coloresState.coloresAsignados) {
                asignarColoresAJugadores();
                if (window.isRoomCreator) {
                    sincronizarColores();
                }
            }
            // Llamar a la función original
            return originalRepartir.call(this);
        };
        console.log('🎨 Función repartirCartillasUnicas extendida con colores');
    }
    
    // Si ya hay jugadores en la sala, asignar colores
    if (window.playersData && Object.keys(window.playersData).length > 0) {
        if (!coloresState.coloresAsignados && window.isRoomCreator) {
            asignarColoresAJugadores();
            sincronizarColores();
        }
    }
    
    // Renderizar favores con color si ya hay datos
    if (herramientasState.favores.total > 0) {
        renderFavoresConColor();
    }
    
    console.log('🎨 Sistema de colores inicializado');
}

/**
 * Calcula los puntos extra por color para un jugador
 * @param {string} playerId - ID del jugador (opcional, usa el local si no se pasa)
 * @param {object} card - Cartilla del jugador
 * @param {array} moves - Historial de movimientos
 * @returns {number} - Puntos extra por color
 */
function calcularPuntosExtraColor(playerId, card, moves) {
    // Si no se pasa playerId, usar el jugador local
    const id = playerId || window.myId;
    if (!id) return 0;
    
    // Obtener el color asignado al jugador
    const colorId = coloresState.asignaciones[id];
    if (!colorId) return 0;
    
    let total = 0;
    const movesSet = new Set(moves);
    
    // Recorrer todas las celdas del tablero
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = card.rows[row][col];
            const isMarked = movesSet.has(`${row}-${col}`);
            
            // Si está marcada y tiene el color del jugador
            if (isMarked && cell.color === colorId && cell.value !== null) {
                total += cell.value; // Sumar el valor del dado
            }
        }
    }
    
    return total;
}

/**
 * Verifica si un color es el asignado al jugador local
 * @param {string} colorId - ID del color a verificar
 * @returns {boolean} - true si es el color del jugador
 */
function esMiColor(colorId) {
    return coloresState.miColor === colorId;
}

/**
 * Verifica si un color es el de otro jugador
 * @param {string} playerId - ID del jugador
 * @param {string} colorId - ID del color a verificar
 * @returns {boolean} - true si es el color del jugador
 */
function esColorDeJugador(playerId, colorId) {
    return coloresState.asignaciones[playerId] === colorId;
}

// ============================================================
// EXPORTAR NUEVAS FUNCIONES
// ============================================================

window.esMiColor = esMiColor;
window.esColorDeJugador = esColorDeJugador;
window.calcularPuntosExtraColor = calcularPuntosExtraColor;
window.COLORES_DISPONIBLES = COLORES_DISPONIBLES;
window.coloresState = coloresState;
window.asignarColoresAJugadores = asignarColoresAJugadores;
window.getColorDeJugador = getColorDeJugador;
window.getMiColor = getMiColor;
window.getColorInfo = getColorInfo;
window.getNombreColor = getNombreColor;
window.getClaseColor = getClaseColor;
window.getHexColor = getHexColor;
window.renderFavoresConColor = renderFavoresConColor;
window.sincronizarColores = sincronizarColores;
window.recibirColoresSincronizados = recibirColoresSincronizados;
window.iniciarConColores = iniciarConColores;
window.initColores = initColores;
window.toggleBordesObjetivo = toggleBordesObjetivo;
window.getMostrarBordesObjetivo = getMostrarBordesObjetivo;

console.log('✅ extra.js cargado - Sistema de colores para jugadores');