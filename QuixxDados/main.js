// ===== PUNTO DE ENTRADA PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function() {
    renderBoard();
    
    var session = loadSession();
    var banner = document.getElementById('sessionBanner');
    if (session && banner) {
        document.getElementById('sessionBannerText').textContent =
            'Tenias una partida abierta en la sala ' + session.roomCode + ' como "' + session.myName + '".';
        banner.style.display = 'block';
    }
});

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