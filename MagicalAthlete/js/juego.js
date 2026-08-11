// ===== LOGICA DEL JUEGO =====
var cartas = [];
var misSelecciones = [];
var MAX_SELECCIONES = 2;
var TOTAL_IMAGENES = 36;

function iniciarJuego() {
    var numJugadores = Object.keys(playersData).length;
    if (numJugadores === 0) {
        alert('No hay jugadores en la sala. Espera a que alguien se una.');
        return;
    }
    
    // Generar cartas: el doble de jugadores
    var numCartas = numJugadores * 2;
    var cartasGeneradas = [];
    
    var indicesDisponibles = [];
    for (var i = 1; i <= TOTAL_IMAGENES; i++) {
        indicesDisponibles.push(i);
    }
    
    // Barajar
    for (var i = indicesDisponibles.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = indicesDisponibles[i];
        indicesDisponibles[i] = indicesDisponibles[j];
        indicesDisponibles[j] = temp;
    }
    
    var indicesSeleccionados = indicesDisponibles.slice(0, numCartas);
    
    for (var i = 0; i < indicesSeleccionados.length; i++) {
        cartasGeneradas.push({
            id: 'carta-' + i,
            numero: indicesSeleccionados[i],
            imagen: 'imagenes/Corredor_' + indicesSeleccionados[i] + '.png',
            seleccionadoPor: null,
            seleccionadoPorId: null
        });
    }
    
    // Resetear selecciones locales
    misSelecciones = [];
    cartas = cartasGeneradas;
    
    // Publicar inicio
    broadcastStart(cartas);
    
    renderizarCartas();
    renderizarMisCorredores();
    actualizarUI();
    saveSession();
}

function seleccionarCarta(cartaId) {
    // Buscar la carta
    var carta = null;
    for (var i = 0; i < cartas.length; i++) {
        if (cartas[i].id === cartaId) {
            carta = cartas[i];
            break;
        }
    }
    
    if (!carta) {
        console.error('Carta no encontrada:', cartaId);
        return;
    }
    
    // Verificar si ya fue seleccionada
    if (carta.seleccionadoPor) {
        alert('Esta carta ya fue seleccionada por ' + carta.seleccionadoPor);
        return;
    }
    
    // Verificar límite de selecciones
    if (misSelecciones.length >= MAX_SELECCIONES) {
        alert('Ya seleccionaste tus 2 cartas maximas.');
        return;
    }
    
    // Marcar como seleccionada por mí
    carta.seleccionadoPor = myName;
    carta.seleccionadoPorId = myId;
    misSelecciones.push(cartaId);
    
    // Actualizar datos del jugador local
    playersData[myId].selecciones = misSelecciones.slice();
    
    // Publicar selección
    broadcastSelect(cartaId);
    
    // Actualizar UI
    renderizarCartas();
    renderizarMisCorredores();
    actualizarUI();
    renderLeaderboard();
    saveSession();
}

function renderizarMisCorredores() {
    var container = document.getElementById('my-cards-container');
    container.innerHTML = '';
    
    if (misSelecciones.length === 0) {
        var empty = document.createElement('div');
        empty.className = 'empty-message';
        empty.textContent = 'Aún no has seleccionado corredores';
        container.appendChild(empty);
        return;
    }
    
    for (var i = 0; i < misSelecciones.length; i++) {
        var cartaId = misSelecciones[i];
        var carta = null;
        for (var j = 0; j < cartas.length; j++) {
            if (cartas[j].id === cartaId) {
                carta = cartas[j];
                break;
            }
        }
        if (carta) {
            var mini = document.createElement('div');
            mini.className = 'my-card-mini';
            var img = document.createElement('img');
            img.src = carta.imagen;
            img.alt = 'Corredor ' + carta.numero;
            mini.appendChild(img);
            var num = document.createElement('div');
            num.className = 'mini-number';
            num.textContent = '#' + carta.numero;
            mini.appendChild(num);
            
            // Evento click para abrir zoom sin botón
            (function(c) {
                mini.addEventListener('click', function() {
                    abrirZoom(c, false);
                });
            })(carta);
            
            container.appendChild(mini);
        }
    }
}

// Función para actualizar la UI general
function actualizarUI() {
    var startBtn = document.getElementById('startGameBtn');
    if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = 'Corredores';
    }
    
    renderLeaderboard();
    renderizarMisCorredores();
}