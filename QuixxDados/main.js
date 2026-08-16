// ===== PUNTO DE ENTRADA PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function() {
    renderBoard();
    renderLog();
    mostrarDatosURL();
    
    var session = loadSession();
    var banner = document.getElementById('sessionBanner');
    var reconnectBtn = document.getElementById('reconnectBtn');
    
    if (session && banner) {
        document.getElementById('sessionBannerText').textContent =
            'Tenías una partida abierta en la sala ' + session.roomCode + ' como "' + session.myName + '".';
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

    // Desbloquea el audio en la primera interaccion (requisito de los navegadores).
    document.addEventListener('pointerdown', primeAudio, { once: true });

    // Sonido generico de click para cualquier boton de modal, salvo los que ya
    // tienen su propio sonido especifico (los de la zona de turno).
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.modal-btn');
        if (btn && !btn.closest('#turnControls')) sfxButton();
    }, true);
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
window.showModal = showModal;
window.closeModal = closeModal;
window.confirmReset = confirmReset;
window.handlePenaltyClick = handlePenaltyClick;
window.reconnectToSession = reconnectToSession;
window.dismissSession = dismissSession;
window.acceptClaim = acceptClaim;
window.declineClaim = declineClaim;
window.startGame = startGame;
window.endTurn = endTurn;
window.closeEndTurnReminder = closeEndTurnReminder;
window.endTurnFromReminder = endTurnFromReminder;
window.closeGameOverAndReset = closeGameOverAndReset;
window.closeNotice = closeNotice;
window.closeViewPlayer = closeViewPlayer;
window.closeRemovePlayerModal = closeRemovePlayerModal;
window.confirmRemovePlayer = confirmRemovePlayer;
window.claimHost = claimHost;
