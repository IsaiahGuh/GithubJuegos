// ===== LEADERBOARD =====
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
        playersArr.push({
            id: id,
            name: playersData[id].name,
            selecciones: playersData[id].selecciones || []
        });
    }
    
    playersArr.sort(function(a, b) {
        return b.selecciones.length - a.selecciones.length;
    });

    for (var p = 0; p < playersArr.length; p++) {
        var player = playersArr[p];
        var isMe = player.id === myId;
        var card = document.createElement('div');
        card.className = 'player-card' + (isMe ? ' me' : '');
        
        var selecciones = player.selecciones || [];
        
        var headerHtml = '<div class="player-card-header">' +
            '<span>' + player.name + (isMe ? ' (Tu)' : '') + '</span>' +
            '<span>' + selecciones.length + '/' + MAX_SELECCIONES + ' cartas</span>' +
        '</div>';
        
        var cartasHtml = '<div class="player-cards">';
        if (selecciones.length === 0) {
            cartasHtml += '<span class="no-cards">Sin cartas seleccionadas</span>';
        } else {
            for (var i = 0; i < selecciones.length; i++) {
                var cartaId = selecciones[i];
                var carta = null;
                for (var j = 0; j < cartas.length; j++) {
                    if (cartas[j].id === cartaId) {
                        carta = cartas[j];
                        break;
                    }
                }
                if (carta) {
                    cartasHtml += '<div class="player-card-mini">' +
                        '<img src="' + carta.imagen + '" alt="' + carta.numero + '">' +
                        '<div class="mini-number">#' + carta.numero + '</div>' +
                    '</div>';
                } else {
                    cartasHtml += '<div class="player-card-mini" style="display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:0.7rem;">?</div>';
                }
            }
        }
        cartasHtml += '</div>';
        
        card.innerHTML = headerHtml + cartasHtml;
        list.appendChild(card);
    }
}