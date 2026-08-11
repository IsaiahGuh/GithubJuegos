function renderizarCartas() {
    var grid = document.getElementById('card-grid');
    grid.innerHTML = '';
    var boardContainer = document.querySelector('.board-container');
    
    if (!cartas || cartas.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">Presiona "Corredores" para comenzar la partida</div>';
        if (boardContainer) boardContainer.style.display = 'block';
        return;
    }
    
    var disponibles = cartas.filter(function(c) {
        return !c.seleccionadoPor;
    });
    
    if (disponibles.length === 0) {
        // Ocultar el contenedor de selección cuando no haya cartas disponibles
        if (boardContainer) boardContainer.style.display = 'none';
        return;
    } else {
        if (boardContainer) boardContainer.style.display = 'block';
    }
    
    for (var i = 0; i < disponibles.length; i++) {
        var carta = disponibles[i];
        var cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.dataset.id = carta.id;
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
        overlaySpan.textContent = 'Disponible';
        overlay.appendChild(overlaySpan);
        cardDiv.appendChild(overlay);
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

function showLoading(text) {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loadingModal').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingModal').style.display = 'none';
}