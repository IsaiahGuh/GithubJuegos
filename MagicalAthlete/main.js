// ===== PUNTO DE ENTRADA PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function() {
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
    
    renderizarCartas();
    renderizarMisCorredores();
    actualizarUI();
});

function mostrarDatosURL() {
    var nombre = localStorage.getItem('magical_athlete_nombre_prefill');
    var sala = localStorage.getItem('magical_athlete_sala_prefill');
    
    if (nombre || sala) {
        var display = document.getElementById('urlDataDisplay');
        if (display) {
            display.style.display = 'block';
            document.getElementById('urlPlayerName').textContent = nombre || '---';
            document.getElementById('urlRoomCode').textContent = sala || '---';
            console.log('Datos configurados:', { nombre: nombre, sala: sala });
        }
    }
}

function entrarSala() {
    var nombre = localStorage.getItem('magical_athlete_nombre_prefill');
    var sala = localStorage.getItem('magical_athlete_sala_prefill');
    
    if (!nombre) {
        alert('No se ha configurado un nombre. Usa ?nombre=XXX en la URL.');
        return;
    }
    
    if (!sala || sala.length !== 4) {
        alert('No se ha configurado una sala valida. Usa ?sala=XXXX en la URL.');
        return;
    }
    
    myName = nombre;
    myId = Math.random().toString(36).substr(2, 9);
    misSelecciones = [];
    
    localStorage.removeItem('magical_athlete_nombre_prefill');
    localStorage.removeItem('magical_athlete_sala_prefill');
    
    connectToRoom(sala.toUpperCase());
}

function joinSuccess(code) {
    hideLoading();
    document.getElementById('lobbyModal').style.display = 'none';
    
    var info = document.getElementById('roomInfoDisplay');
    info.style.display = 'inline-block';
    info.textContent = 'SALA: ' + code;
    
    document.getElementById('leaderboardPanel').style.display = 'flex';
    renderLeaderboard();
}

window.entrarSala = entrarSala;
window.reconnectToSession = reconnectToSession;
window.dismissSession = dismissSession;
window.acceptClaim = acceptClaim;
window.declineClaim = declineClaim;
window.iniciarJuego = iniciarJuego;