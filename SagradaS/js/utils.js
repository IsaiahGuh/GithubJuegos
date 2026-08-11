// ===== UTILS.JS =====
// Utilidades generales

// ============================================================
// FUNCIONES ORIGINALES (TODAS SE MANTIENEN)
// ============================================================

// Generar ID único
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Generar código de sala (4 caracteres)
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// Mostrar/ocultar loading
function showLoading(text) {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loadingModal').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingModal').style.display = 'none';
}

// Mostrar/ocultar modales
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

// Obtener nombre del jugador
function getPlayerName() {
    let name = document.getElementById('playerName').value.trim();
    return name || "Jugador " + Math.floor(Math.random() * 100);
}

// Validar código de sala
function isValidRoomCode(code) {
    return code && code.length === 4 && /^[A-Z0-9]{4}$/.test(code);
}

// ============================================================
// NUEVAS FUNCIONES PARA DADOS (SOLO SE AGREGAN)
// ============================================================

const PUNTOS = {
    1: [[50,50]],
    2: [[25,25],[75,75]],
    3: [[25,25],[50,50],[75,75]],
    4: [[25,25],[75,25],[25,75],[75,75]],
    5: [[25,25],[75,25],[50,50],[25,75],[75,75]],
    6: [[25,25],[75,25],[25,50],[75,50],[25,75],[75,75]]
};

function renderizarDado(valor, bg = null, dotColor = '#ffffff') {
    const pts = PUNTOS[valor] || PUNTOS[1];
    const size = '22%';
    
    // Si bg es null, no poner fondo
    const bgStyle = bg ? `background:${bg};` : '';
    
    let html = `<div class="dado-visual" style="display:flex;justify-content:center;align-items:center;width:100%;height:100%;${bgStyle}border-radius:6px;padding:3px;box-sizing:border-box;position:relative;">`;
    
    for (const [x, y] of pts) {
        html += `<div style="position:absolute;left:${x}%;top:${y}%;transform:translate(-50%,-50%);background:${dotColor};border-radius:50%;width:${size};height:${size};box-shadow:0 1px 3px rgba(0,0,0,0.2);"></div>`;
    }
    
    html += `</div>`;
    return html;
}

function renderizarOpcionesDado(valores, seleccionado = null, bg = '#2d2d2d') {
    return valores.map(v => {
        const dotColor = v === seleccionado ? '#4caf50' : '#ffffff';
        const bgFinal = v === seleccionado ? '#1a1a1a' : bg;
        return `
            <button class="dado-option ${v === seleccionado ? 'selected' : ''}" data-valor="${v}">
                ${renderizarDado(v, bgFinal, dotColor)}
            </button>
        `;
    }).join('');
}

// ============================================================
// EXPORTAR TODO (funciones originales + nuevas)
// ============================================================

// Funciones originales
window.generateId = generateId;
window.generateRoomCode = generateRoomCode;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showModal = showModal;
window.hideModal = hideModal;
window.getPlayerName = getPlayerName;
window.isValidRoomCode = isValidRoomCode;

// Nuevas funciones de dados
window.renderizarDado = renderizarDado;
window.renderizarOpcionesDado = renderizarOpcionesDado;
window.PUNTOS = PUNTOS;