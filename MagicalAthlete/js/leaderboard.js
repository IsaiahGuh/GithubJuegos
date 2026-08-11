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
            puntos: puntos
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
        var headerHtml = '<div class="player-card-header">' +
            '<span>' + player.name + (isMe ? ' (Tu)' : '') + '</span>' +
            '<span>Puntos: ' + player.puntos + '</span>' +
        '</div>';
        card.innerHTML = headerHtml;
        list.appendChild(card);
    }
}