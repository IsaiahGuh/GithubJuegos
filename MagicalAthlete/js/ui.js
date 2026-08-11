// ===== RENDERIZADO DE CARTAS =====
function renderizarCartas() {
    var grid = document.getElementById('card-grid');
    grid.innerHTML = '';
    
    if (!cartas || cartas.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">Presiona "Corredores" para comenzar la partida</div>';
        return;
    }
    
    // Filtrar cartas: solo mostrar las que NO están seleccionadas por nadie
    var disponibles = cartas.filter(function(c) {
        return !c.seleccionadoPor;
    });
    
    if (disponibles.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">Todas las cartas han sido seleccionadas</div>';
        return;
    }
    
    for (var i = 0; i < disponibles.length; i++) {
        var carta = disponibles[i];
        var cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.dataset.id = carta.id;
        
        // Imagen
        var img = document.createElement('img');
        img.src = carta.imagen;
        img.alt = 'Corredor ' + carta.numero;
        img.loading = 'lazy';
        cardDiv.appendChild(img);
        
        // Número
        var numberSpan = document.createElement('div');
        numberSpan.className = 'card-number';
        numberSpan.textContent = '#' + carta.numero;
        cardDiv.appendChild(numberSpan);
        
        // Overlay (siempre "Disponible" para cartas no seleccionadas)
        var overlay = document.createElement('div');
        overlay.className = 'card-overlay';
        var overlaySpan = document.createElement('span');
        overlaySpan.textContent = 'Disponible';
        overlay.appendChild(overlaySpan);
        cardDiv.appendChild(overlay);
        
        // Evento: abrir zoom al hacer clic
        (function(c) {
            cardDiv.addEventListener('click', function() {
                if (!c.seleccionadoPor) {
                    abrirZoom(c, true);
                }
            });
        })(carta);
        
        grid.appendChild(cardDiv);
    }
}

// ===== ACTUALIZACION UI =====
function actualizarUI() {
    var startBtn = document.getElementById('startGameBtn');
    if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = 'Corredores';
    }
    
    renderLeaderboard();
    renderizarMisCorredores();
}

// ===== FUNCIONES DE CARGA =====
function showLoading(text) {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loadingModal').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingModal').style.display = 'none';
}