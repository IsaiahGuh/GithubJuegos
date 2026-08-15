// ===== LEADERBOARD =====
function renderLeaderboard() {
    var list = document.getElementById('playersList');
    list.innerHTML = '';
    
    var playerIds = Object.keys(playersData);
    var playersArr = [];
    for (var i = 0; i < playerIds.length; i++) {
        var id = playerIds[i];
        playersArr.push({
            id: id,
            name: playersData[id].name,
            score: playersData[id].score || 0,
            moves: playersData[id].moves || []
        });
    }
    
    playersArr.sort(function(a, b) {
        return b.score - a.score;
    });

    for (var p = 0; p < playersArr.length; p++) {
        var player = playersArr[p];
        var isMe = player.id === myId;
        var card = document.createElement('div');
        card.className = 'player-card' + (isMe ? ' me' : '');
        
        var pMoves = player.moves || [];

        var boardHtml = '<div class="mini-board">';
        for (var r = 0; r < rowsConfig.length; r++) {
            var rc = rowsConfig[r];
            boardHtml += '<div class="mini-row ' + rc.id + '">';
            for (var n = 0; n < rc.numbers.length; n++) {
                var num = rc.numbers[n];
                var isMarked = false;
                for (var i = 0; i < pMoves.length; i++) {
                    if (pMoves[i] === rc.id + '-' + n) {
                        isMarked = true;
                        break;
                    }
                }
                boardHtml += '<div class="mini-cell' + (isMarked ? ' marked' : '') + '">' + num + '</div>';
            }
            var isLockMarked = false;
            for (var i = 0; i < pMoves.length; i++) {
                if (pMoves[i] === rc.id + '-11') {
                    isLockMarked = true;
                    break;
                }
            }
            boardHtml += '<div class="mini-cell lock' + (isLockMarked ? ' marked' : '') + '">C</div>';
            boardHtml += '</div>';
        }
        boardHtml += '</div>';

        var penaltiesHtml = '<div class="mini-penalties"><span style="font-size:10px; color:var(--text-muted); margin-right:4px;">Fallas:</span>';
        for (var i = 0; i < 4; i++) {
            var isPenMarked = false;
            for (var j = 0; j < pMoves.length; j++) {
                if (pMoves[j] === 'penalty-' + i) {
                    isPenMarked = true;
                    break;
                }
            }
            penaltiesHtml += '<div class="mini-pbox' + (isPenMarked ? ' marked' : '') + '"></div>';
        }
        penaltiesHtml += '</div>';

        card.innerHTML = 
            '<div class="player-card-header">' +
                '<span>' + player.name + (isMe ? ' (Tu)' : '') + (player.id === hostId ? ' [Anfitrion]' : '') + '</span>' +
                '<span>' + player.score + ' pts</span>' +
            '</div>' +
            boardHtml +
            penaltiesHtml;
        
        list.appendChild(card);
    }
}