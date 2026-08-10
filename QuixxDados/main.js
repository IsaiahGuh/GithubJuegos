// ===== PUNTO DE ENTRADA PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function() {
    renderBoard();
    mostrarDatosURL();
    
    var session = loadSession();
    var banner = document.getElementById('sessionBanner');
    var reconnectBtn = document.getElementById('reconnectBtn');
    
    if (session && banner) {
        document.getElementById('sessionBannerText').textContent =
            'Tenías una partida abierta en la sala ' + session.roomCode + ' como "' + session.myName + '".';
        banner.style.display = 'block';
        
        // Habilitar el boton de reconectar
        if (reconnectBtn) {
            reconnectBtn.disabled = false;
            reconnectBtn.style.opacity = '1';
            reconnectBtn.style.cursor = 'pointer';
        }
    } else {
        // Deshabilitar el boton de reconectar si no hay sesion
        if (reconnectBtn) {
            reconnectBtn.disabled = true;
            reconnectBtn.style.opacity = '0.5';
            reconnectBtn.style.cursor = 'not-allowed';
        }
    }
});

// ===== MOSTRAR DATOS DESDE URL =====
function mostrarDatosURL() {
    const nombre = localStorage.getItem('quixx_nombre_prefill');
    const sala = localStorage.getItem('quixx_sala_prefill');
    
    if (nombre || sala) {
        const display = document.getElementById('urlDataDisplay');
        if (display) {
            display.style.display = 'block';
            document.getElementById('urlPlayerName').textContent = nombre || '---';
            document.getElementById('urlRoomCode').textContent = sala || '---';
            
            console.log('Datos configurados:', { nombre, sala });
        }
    }
}

// ===== EXPORTAR FUNCIONES GLOBALES =====
window.entrarSala = entrarSala;
window.backToLobby = backToLobby;
window.showModal = showModal;
window.closeModal = closeModal;
window.confirmReset = confirmReset;
window.handlePenaltyClick = handlePenaltyClick;
window.reconnectToSession = reconnectToSession;
window.dismissSession = dismissSession;
window.acceptClaim = acceptClaim;
window.declineClaim = declineClaim;