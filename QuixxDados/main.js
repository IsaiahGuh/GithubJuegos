// ===== PUNTO DE ENTRADA PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function() {
    renderBoard();
    mostrarDatosURL();
    
    var session = loadSession();
    var banner = document.getElementById('sessionBanner');
    if (session && banner) {
        document.getElementById('sessionBannerText').textContent =
            'Tenías una partida abierta en la sala ' + session.roomCode + ' como "' + session.myName + '".';
        banner.style.display = 'block';
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
            
            if (nombre) {
                document.getElementById('playerName').value = nombre;
            }
            if (sala) {
                console.log('🏠 Sala preconfigurada:', sala);
            }
        }
    }
}

// ===== EXPORTAR FUNCIONES GLOBALES =====
window.createRoom = createRoom;
window.joinRoom = joinRoom;
window.showJoinModal = showJoinModal;
window.backToLobby = backToLobby;
window.showModal = showModal;
window.closeModal = closeModal;
window.confirmReset = confirmReset;
window.handlePenaltyClick = handlePenaltyClick;
window.reconnectToSession = reconnectToSession;
window.dismissSession = dismissSession;
window.acceptClaim = acceptClaim;
window.declineClaim = declineClaim;