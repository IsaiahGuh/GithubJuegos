// ui.js (sin cambios)
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
        return c.tanda === tandaActual && !c.seleccionadoPor && !c.descartada;
    });
    
    if (disponibles.length === 0) {
        var haySinDescartar = cartas.some(function(c) {
            return c.tanda === tandaActual && !c.descartada;
        });
        if (haySinDescartar) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">Todas las cartas de esta tanda ya fueron seleccionadas</div>';
        } else {
            if (tandaActual < TOTAL_TANDAS - 1) {
                grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">Esperando siguiente tanda...</div>';
            } else {
                grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">Todas las cartas han sido seleccionadas o descartadas</div>';
            }
        }
        if (boardContainer) boardContainer.style.display = 'block';
        return;
    }
    
    if (boardContainer) boardContainer.style.display = 'block';
    
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
                if (!c.seleccionadoPor && !c.descartada) {
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

function renderizarMisCorredores() {
    var container = document.getElementById('my-cards-container');
    container.innerHTML = '';
    if (misSelecciones.length === 0) {
        var empty = document.createElement('div');
        empty.className = 'empty-message';
        empty.textContent = 'Aun no has seleccionado corredores';
        container.appendChild(empty);
        return;
    }
    var misCartas = [];
    for (var i = 0; i < misSelecciones.length; i++) {
        var cId = misSelecciones[i];
        var carta = null;
        for (var j = 0; j < cartas.length; j++) {
            if (cartas[j].id === cId) {
                carta = cartas[j];
                break;
            }
        }
        if (carta && !carta.descartada) {
            misCartas.push(carta);
        }
    }
    if (misCartas.length === 0) {
        var empty2 = document.createElement('div');
        empty2.className = 'empty-message';
        empty2.textContent = 'No tienes cartas disponibles';
        container.appendChild(empty2);
        return;
    }
    var activeId = playersData[myId] ? playersData[myId].activeCardId : null;
    for (var k = 0; k < misCartas.length; k++) {
        var carta = misCartas[k];
        var esActiva = (activeId === carta.id);
        var esGanadora = carta.esGanadora || false;
        var wrapper = document.createElement('div');
        wrapper.className = 'my-card-wrapper' + (esActiva ? ' activa' : '') + (esGanadora ? ' ganadora' : '');
        var imgContainer = document.createElement('div');
        imgContainer.className = 'my-card-img';
        imgContainer.addEventListener('click', function(c) {
            return function(e) {
                e.stopPropagation();
                abrirZoom(c, false, true);
            };
        }(carta));
        var img = document.createElement('img');
        img.src = carta.imagen;
        img.alt = 'Corredor ' + carta.numero;
        imgContainer.appendChild(img);
        var num = document.createElement('div');
        num.className = 'mini-number';
        num.textContent = '#' + carta.numero;
        imgContainer.appendChild(num);
        if (esGanadora) {
            var badge = document.createElement('div');
            badge.className = 'ganadora-badge';
            badge.textContent = 'GANADORA';
            imgContainer.appendChild(badge);
        }
        wrapper.appendChild(imgContainer);
        var btnUsar = document.createElement('button');
        btnUsar.className = 'btn-sm btn-usar';
        btnUsar.textContent = esActiva ? 'En uso' : 'Usar';
        if (carta.esGanadora || carta.descartada) {
            btnUsar.disabled = true;
        } else if (activeId && !esActiva) {
            // Ya elegiste otra carta para esta ronda: no se puede cambiar.
            btnUsar.disabled = true;
        }
        btnUsar.addEventListener('click', function(cId) {
            return function(e) {
                e.stopPropagation();
                setActiveCard(cId);
            };
        }(carta.id));
        wrapper.appendChild(btnUsar);
        container.appendChild(wrapper);
    }
}