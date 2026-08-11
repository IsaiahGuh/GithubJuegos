// ===== RENDERIZADO DE CARTAS =====
function renderizarCartas() {
    var grid = document.getElementById('card-grid');
    grid.innerHTML = '';
    
    if (!cartas || cartas.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">Presiona "Corredores" para comenzar la partida</div>';
        return;
    }
    
    for (var i = 0; i < cartas.length; i++) {
        var carta = cartas[i];
        var cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.dataset.id = carta.id;
        
        var estaSeleccionadaPorMi = false;
        for (var j = 0; j < misSelecciones.length; j++) {
            if (misSelecciones[j] === carta.id) {
                estaSeleccionadaPorMi = true;
                break;
            }
        }
        
        var estaSeleccionadaPorOtro = carta.seleccionadoPor && carta.seleccionadoPorId !== myId;
        
        if (estaSeleccionadaPorMi) {
            cardDiv.classList.add('selected');
        } else if (estaSeleccionadaPorOtro) {
            cardDiv.classList.add('selected-by-other');
        }
        
        var img = document.createElement('img');
        img.src = carta.imagen;
        img.alt = 'Corredor ' + carta.numero;
        img.loading = 'lazy';
        cardDiv.appendChild(img);
        
        var numberSpan = document.createElement('div');
        numberSpan.className = 'card-number';
        numberSpan.textContent = '#' + carta.numero;
        cardDiv.appendChild(numberSpan);
        
        var overlay = document.createElement('div');
        overlay.className = 'card-overlay';
        var overlaySpan = document.createElement('span');
        
        if (estaSeleccionadaPorMi) {
            overlaySpan.textContent = 'Seleccionada';
        } else if (estaSeleccionadaPorOtro) {
            overlaySpan.textContent = 'Seleccionada por ' + carta.seleccionadoPor;
        } else {
            overlaySpan.textContent = 'Disponible';
        }
        overlay.appendChild(overlaySpan);
        cardDiv.appendChild(overlay);
        
        var checkMark = document.createElement('div');
        checkMark.className = 'check-mark';
        checkMark.textContent = 'OK';
        cardDiv.appendChild(checkMark);
        
        if (!estaSeleccionadaPorMi && !estaSeleccionadaPorOtro && gameStarted) {
            (function(cartaId) {
                cardDiv.addEventListener('click', function() {
                    seleccionarCarta(cartaId);
                });
            })(carta.id);
        } else if (!gameStarted) {
            cardDiv.style.cursor = 'default';
        }
        
        grid.appendChild(cardDiv);
    }
}

// ===== ACTUALIZACION UI =====
function actualizarUI() {
    var countSpan = document.getElementById('selected-count');
    if (countSpan) {
        countSpan.textContent = misSelecciones.length;
    }
    
    var startBtn = document.getElementById('startGameBtn');
    if (startBtn) {
        // Siempre habilitado, sin restricción de jugadores
        startBtn.disabled = false;
        startBtn.textContent = 'Corredores';
    }
    
    // Actualizar leaderboard
    renderLeaderboard();
}

// ===== FUNCIONES DE CARGA =====
function showLoading(text) {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loadingModal').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingModal').style.display = 'none';
}