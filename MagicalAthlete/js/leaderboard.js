// leaderboard.js (sin cambios)
function renderLeaderboard() {
    var list = document.getElementById('playersList');
    list.innerHTML = '';
    var playerIds = Object.keys(playersData);
    if (playerIds.length === 0) {
        list.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 20px;">Esperando jugadores...</div>';
        return;
    }
    var playersArr = [];
    for (var i = 0; i < playerIds.length; i++) {
        var id = playerIds[i];
        var data = playersData[id];
        var puntos = puntosPorJugador[id] || 0;
        playersArr.push({
            id: id,
            name: data.name,
            puntos: puntos,
            selecciones: data.selecciones || [],
            activeCardId: data.activeCardId || null
        });
    }
    playersArr.sort(function(a, b) {
        return b.puntos - a.puntos;
    });
    for (var p = 0; p < playersArr.length; p++) {
        var player = playersArr[p];
        var isMe = player.id === myId;
        var card = document.createElement('div');
        card.className = 'player-card' + (isMe ? ' me' : '');

        card.addEventListener('click', function(pid) {
            return function() {
                if (typeof todosEligieronCarta === 'function' && !todosEligieronCarta()) {
                    // Todavia faltan jugadores por elegir su corredor de esta
                    // ronda: no mostramos nada (sin alerta) hasta que todos elijan.
                    return;
                }
                var activeId = playersData[pid] ? playersData[pid].activeCardId : null;
                if (activeId) {
                    var carta = null;
                    for (var i = 0; i < cartas.length; i++) {
                        if (cartas[i].id === activeId) {
                            carta = cartas[i];
                            break;
                        }
                    }
                    if (carta) {
                        abrirZoom(carta, false, true);
                    } else {
                        alert('La carta activa de este jugador ya no esta disponible.');
                    }
                } else {
                    alert('Este jugador no tiene una carta activa seleccionada.');
                }
            };
        }(player.id));

        var headerHtml = '<div class="player-card-header">' +
            '<span>' + player.name + (isMe ? ' (Tu)' : '') + '</span>' +
            '<span>Puntos: ' + player.puntos + '</span>' +
        '</div>';
        var seleccionesHtml = '<div style="display:flex; gap:4px; flex-wrap:wrap; margin-top:4px;">';
        if (player.selecciones.length === 0) {
            seleccionesHtml += '<span style="font-size:0.7rem; color:var(--text-muted);">Sin selecciones</span>';
        } else {
            for (var s = 0; s < player.selecciones.length; s++) {
                var cId = player.selecciones[s];
                var carta = null;
                for (var j = 0; j < cartas.length; j++) {
                    if (cartas[j].id === cId) {
                        carta = cartas[j];
                        break;
                    }
                }
                if (carta) {
                    seleccionesHtml += '<span style="font-size:0.7rem; background:#2a2a4a; padding:2px 6px; border-radius:4px;">#' + carta.numero + '</span>';
                }
            }
        }
        seleccionesHtml += '</div>';
        card.innerHTML = headerHtml + seleccionesHtml;
        list.appendChild(card);
    }
}