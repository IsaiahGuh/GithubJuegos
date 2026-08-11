// ===== MAIN.JS =====
// Punto de entrada del juego - CON SISTEMA DE ENTRADA Y RECONEXION

document.addEventListener('DOMContentLoaded', function() {
    // ============================================================
    // INICIALIZAR MODULOS EXISTENTES
    // ============================================================
    
    if (typeof initModals === 'function') initModals();
    if (typeof initUI === 'function') initUI();
    if (typeof initMarcadorModal === 'function') initMarcadorModal();
    if (typeof initColores === 'function') initColores();
    
    // ============================================================
    // MOSTRAR DATOS DESDE URL
    // ============================================================
    
    mostrarDatosURL();
    
    // ============================================================
    // VERIFICAR SESION GUARDADA
    // ============================================================
    
    var session = null;
    if (typeof loadSession === 'function') {
        session = loadSession();
    }
    
    var banner = document.getElementById('sessionBanner');
    var reconnectBtn = document.getElementById('reconnectBtn');
    
    if (session && banner) {
        var bannerText = document.getElementById('sessionBannerText');
        if (bannerText) {
            bannerText.textContent = 
                'Tenías una partida abierta en la sala ' + session.roomCode + ' como "' + session.myName + '".';
        }
        banner.style.display = 'block';
        
        if (reconnectBtn) {
            reconnectBtn.disabled = false;
            reconnectBtn.style.opacity = '1';
            reconnectBtn.style.cursor = 'pointer';
        }
    } else {
        if (reconnectBtn) {
            reconnectBtn.disabled = true;
            reconnectBtn.style.opacity = '0.5';
            reconnectBtn.style.cursor = 'not-allowed';
        }
    }
    
    // ============================================================
    // OCULTAR GAME INFO INICIAL
    // ============================================================
    
    var gameInfo = document.getElementById('gameInfo');
    if (gameInfo) {
        gameInfo.style.display = 'none';
    }
    
    // ============================================================
    // ATAJOS DE TECLADO
    // ============================================================
    
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            if (typeof undoLastMark === 'function') {
                undoLastMark();
            }
        }
        
        if (e.key === 'Escape') {
            if (typeof closeMarcador === 'function' && window.marcadorState?.isOpen) {
                closeMarcador();
            }
            var modals = document.querySelectorAll('.modal-overlay');
            modals.forEach(function(modal) {
                if (modal.style.display === 'flex' && !modal.classList.contains('no-close-on-outside')) {
                    if (typeof closeModalById === 'function') {
                        closeModalById(modal.id);
                    }
                }
            });
        }
    });
    
    console.log('SagradaS - Juego cargado correctamente');
});

// ============================================================
// FUNCION: MOSTRAR DATOS URL
// ============================================================

function mostrarDatosURL() {
    var nombre = localStorage.getItem('sagradas_nombre_prefill');
    var sala = localStorage.getItem('sagradas_sala_prefill');
    
    if (nombre || sala) {
        var display = document.getElementById('urlDataDisplay');
        if (display) {
            display.style.display = 'block';
            var nameEl = document.getElementById('urlPlayerName');
            var roomEl = document.getElementById('urlRoomCode');
            if (nameEl) nameEl.textContent = nombre || '---';
            if (roomEl) roomEl.textContent = sala || '---';
        }
    }
}

// ============================================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================================

window.mostrarDatosURL = mostrarDatosURL;
window.entrarSala = entrarSala;
window.reconnectToSession = reconnectToSession;
window.dismissSession = dismissSession;