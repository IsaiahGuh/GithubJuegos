// js/mqtt/lobby.js
// ========== GESTION DEL LOBBY ==========

function getEquipoFromToggle(toggleId) {
    var toggle = document.getElementById(toggleId);
    return toggle && toggle.checked ? 'B' : 'A';
}

function mostrarLobby() {
    var modal = document.getElementById('lobbyModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    }
}

function ocultarLobby() {
    var modal = document.getElementById('lobbyModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

function mostrarUnirse() {
    ocultarLobby();
    var modal = document.getElementById('joinModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
        
        var codeInput = document.getElementById('roomCodeInput');
        if (codeInput) {
            codeInput.value = '';
            codeInput.placeholder = 'ABCD';
            codeInput.readOnly = false;
            codeInput.style.opacity = '1';
            codeInput.style.color = 'white';
        }
        
        setTimeout(function() { codeInput.focus(); }, 100);
    }
}

function volverLobby() {
    var joinModal = document.getElementById('joinModal');
    if (joinModal) {
        joinModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
    
    var roomInput = document.getElementById('roomCodeInput');
    if (roomInput) {
        roomInput.value = '';
        roomInput.placeholder = 'ABCD';
        roomInput.readOnly = false;
        roomInput.style.opacity = '1';
        roomInput.style.color = 'white';
    }
    
    mostrarLobby();
}

// ===== ENTRAR (como Quixx) =====
function entrarSala() {
    var nombre = localStorage.getItem('cassettes_nombre_prefill');
    var sala = localStorage.getItem('cassettes_sala_prefill');
    var equipo = getEquipoFromToggle('equipoToggle');
    
    if (!nombre) {
        alert('No se ha configurado un nombre. Usa ?nombre=XXX en la URL.');
        return;
    }
    
    if (!sala || sala.length !== 4) {
        alert('No se ha configurado una sala valida. Usa ?sala=XXXX en la URL.');
        return;
    }
    
    window.estadoJugador.nombre = nombre;
    window.estadoJugador.equipo = equipo;
    window.estadoJugador.id = Math.random().toString(36).substr(2, 9);
    
    localStorage.removeItem('cassettes_nombre_prefill');
    localStorage.removeItem('cassettes_sala_prefill');
    
    ocultarLobby();
    
    if (window.showLoading) window.showLoading('Conectando...');
    
    window.conectarSala(sala.toUpperCase(), nombre, equipo);
}

function crearSala() {
    var nombre = localStorage.getItem('cassettes_nombre_prefill');
    var equipo = getEquipoFromToggle('equipoToggle');
    
    if (!nombre) {
        alert('No se ha configurado un nombre. Usa ?nombre=XXX en la URL.');
        return;
    }
    
    var codigo = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    ocultarLobby();
    
    window.estadoJugador.nombre = nombre;
    window.estadoJugador.equipo = equipo;
    window.estadoJugador.id = Math.random().toString(36).substr(2, 9);
    
    localStorage.removeItem('cassettes_nombre_prefill');
    localStorage.removeItem('cassettes_sala_prefill');
    
    if (window.showLoading) window.showLoading('Conectando...');
    
    window.conectarSala(codigo, nombre, equipo);
}

function unirseSala() {
    var nombre = localStorage.getItem('cassettes_nombre_prefill');
    var equipo = getEquipoFromToggle('equipoToggleJoin');
    var codigo = document.getElementById('roomCodeInput').value.trim().toUpperCase();
    
    if (!nombre) {
        alert('No se ha configurado un nombre. Usa ?nombre=XXX en la URL.');
        return;
    }
    
    if (codigo.length !== 4) {
        window.mostrarMensaje('Aviso', 'El codigo debe tener 4 caracteres');
        return;
    }
    
    var joinModal = document.getElementById('joinModal');
    if (joinModal) {
        joinModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
    
    window.estadoJugador.nombre = nombre;
    window.estadoJugador.equipo = equipo;
    window.estadoJugador.id = Math.random().toString(36).substr(2, 9);
    
    localStorage.removeItem('cassettes_nombre_prefill');
    localStorage.removeItem('cassettes_sala_prefill');
    
    if (window.showLoading) window.showLoading('Conectando...');
    
    window.conectarSala(codigo, nombre, equipo);
}

function mostrarInfoSala(codigo) {
    var info = document.getElementById('roomInfoDisplay');
    if (info) {
        info.style.display = 'inline-block';
        info.textContent = 'Sala: ' + codigo + ' | ' + window.estadoJugador.nombre + ' (Equipo ' + window.estadoJugador.equipo + ')';
    }
    
    if (!window.jugadoresRemotos) {
        window.jugadoresRemotos = {};
    }
    window.jugadoresRemotos[window.estadoJugador.id] = {
        nombre: window.estadoJugador.nombre,
        equipo: window.estadoJugador.equipo,
        conectado: true
    };
    
    if (window.actualizarLeaderboard) {
        setTimeout(function() { window.actualizarLeaderboard(); }, 200);
    }
}

function showLoading(text) {
    var modal = document.getElementById('loadingModal');
    var textEl = document.getElementById('loadingText');
    if (textEl) textEl.textContent = text || 'Conectando...';
    if (modal) {
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    }
}

function hideLoading() {
    var modal = document.getElementById('loadingModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

// ===== ASIGNAR AL SCOPE GLOBAL =====
window.entrarSala = entrarSala;
window.mostrarLobby = mostrarLobby;
window.ocultarLobby = ocultarLobby;
window.mostrarUnirse = mostrarUnirse;
window.volverLobby = volverLobby;
window.crearSala = crearSala;
window.unirseSala = unirseSala;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.mostrarInfoSala = mostrarInfoSala;