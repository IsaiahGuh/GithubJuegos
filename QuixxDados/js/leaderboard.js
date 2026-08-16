// ===== LEADERBOARD =====
var REMOVE_ICON_SVG = '<svg viewBox="0 0 24 24" width="14" height="14"><line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';

// Construye el HTML del mini tablero (reutilizado en la tarjeta del leaderboard y en el
// modal de "ver tablero" de otro jugador).
function buildMiniBoardHtml(pMoves) {
    var html = '<div class="mini-board">';
    for (var r = 0; r < rowsConfig.length; r++) {
        var rc = rowsConfig[r];
        html += '<div class="mini-row ' + rc.id + '">';
        for (var n = 0; n < rc.numbers.length; n++) {
            var num = rc.numbers[n];
            var isMarked = pMoves.indexOf(rc.id + '-' + n) !== -1;
            html += '<div class="mini-cell' + (isMarked ? ' marked' : '') + '">' + num + '</div>';
        }
        var isLockMarked = pMoves.indexOf(rc.id + '-11') !== -1;
        html += '<div class="mini-cell lock' + (isLockMarked ? ' marked' : '') + '">C</div>';
        html += '</div>';
    }
    html += '</div>';
    return html;
}

function buildMiniPenaltiesHtml(pMoves) {
    var html = '<div class="mini-penalties"><span style="font-size:10px; color:var(--text-muted); margin-right:4px;">Fallas:</span>';
    for (var i = 0; i < 4; i++) {
        var isPenMarked = pMoves.indexOf('penalty-' + i) !== -1;
        html += '<div class="mini-pbox' + (isPenMarked ? ' marked' : '') + '"></div>';
    }
    html += '</div>';
    return html;
}

function renderLeaderboard() {
    var list = document.getElementById('playersList');
    if (!list) return;
    list.innerHTML = '';

    var showHostControls = isRoomCreator && !gameStarted;
    var showIngameRemove = isRoomCreator && gameStarted;

    var isHidden = function(id) { return typeof hiddenJoiningIds !== 'undefined' && hiddenJoiningIds[id]; };

    var arr;
    if (!gameStarted) {
        arr = [];
        for (var i = 0; i < pendingOrder.length; i++) {
            var id = pendingOrder[i];
            if (playersData[id]) arr.push(Object.assign({ id: id }, playersData[id]));
        }
        var known = arr.map(function(p) { return p.id; });
        Object.keys(playersData).forEach(function(id2) {
            if (known.indexOf(id2) === -1) arr.push(Object.assign({ id: id2 }, playersData[id2]));
        });
    } else {
        arr = Object.keys(playersData).map(function(id3) { return Object.assign({ id: id3 }, playersData[id3]); });
        arr.sort(function(a, b) { return (b.score || 0) - (a.score || 0); });
    }
    arr = arr.filter(function(p) { return !isHidden(p.id); });

    arr.forEach(function(p, idx) {
        var card = document.createElement('div');
        card.className = 'player-card';
        var hex = colorHexOf(p.color);
        card.style.borderLeftColor = hex;
        var pMoves = p.moves || [];

        var orderHTML = '';
        var scoreSlotHTML = '<span class="pc-score">' + (p.score || 0) + ' pts</span>';
        var ingameRemoveHTML = '';
        if (showHostControls) {
            var canRemove = p.id !== myId;
            orderHTML =
                '<span class="pc-order-controls">' +
                    '<button type="button" class="pc-order-btn" data-act="up" ' + (idx === 0 ? 'disabled' : '') + ' title="Subir">&#9650;</button>' +
                    '<button type="button" class="pc-order-btn" data-act="down" ' + (idx === arr.length - 1 ? 'disabled' : '') + ' title="Bajar">&#9660;</button>' +
                '</span>';
            scoreSlotHTML = canRemove
                ? '<button type="button" class="pc-remove-btn" data-act="remove" title="Eliminar">' + REMOVE_ICON_SVG + '</button>'
                : '';
        } else if (showIngameRemove && p.id !== myId && p.offline) {
            ingameRemoveHTML = '<button type="button" class="pc-remove-btn pc-remove-btn-ingame" data-act="remove-ingame" title="Eliminar de la partida (desconectado)">' + REMOVE_ICON_SVG + '</button>';
        }

        var canClaimHostHere = p.id === hostId && p.offline && p.id !== myId;
        var claimHostHTML = canClaimHostHere
            ? '<button type="button" class="modal-btn btn-primary pc-claim-host-btn" data-act="claim-host">Ser anfitrion</button>'
            : '';

        var offlineTagHTML = p.offline ? '<span class="pc-offline-tag">Desconectado</span>' : '';
        var isTurn = gameStarted && turnOrder[currentTurnIndex] === p.id;

        card.classList.toggle('pc-offline', !!p.offline);
        card.innerHTML =
            '<div class="player-card-header">' +
                '<span class="pc-name">' +
                    '<span style="width:10px;height:10px;border-radius:50%;background:' + hex + ';display:inline-block;flex-shrink:0;"></span>' +
                    p.name + (p.id === myId ? ' (Tu)' : '') + (p.id === hostId ? ' [Anfitrion]' : '') +
                    (isTurn ? '<span class="pc-turn-tag">TURNO</span>' : '') + offlineTagHTML +
                '</span>' +
                '<span class="pc-right">' + claimHostHTML + scoreSlotHTML + orderHTML + ingameRemoveHTML + '</span>' +
            '</div>' +
            buildMiniBoardHtml(pMoves) +
            buildMiniPenaltiesHtml(pMoves);

        if (showHostControls) {
            var upBtn = card.querySelector('[data-act="up"]');
            var downBtn = card.querySelector('[data-act="down"]');
            var removeBtn = card.querySelector('[data-act="remove"]');
            if (upBtn) upBtn.addEventListener('click', function(e) { e.stopPropagation(); movePlayerUp(p.id); });
            if (downBtn) downBtn.addEventListener('click', function(e) { e.stopPropagation(); movePlayerDown(p.id); });
            if (removeBtn) removeBtn.addEventListener('click', function(e) { e.stopPropagation(); hostRemovePlayer(p.id); });
        } else {
            if (showIngameRemove && p.id !== myId && p.offline) {
                var removeIngameBtn = card.querySelector('[data-act="remove-ingame"]');
                if (removeIngameBtn) removeIngameBtn.addEventListener('click', function(e) { e.stopPropagation(); requestRemovePlayer(p.id); });
            }
            card.addEventListener('click', function() { openViewPlayer(p.id); });
        }

        if (canClaimHostHere) {
            var claimBtn = card.querySelector('[data-act="claim-host"]');
            if (claimBtn) claimBtn.addEventListener('click', function(e) { e.stopPropagation(); claimHost(); });
        }

        list.appendChild(card);
    });

    refreshViewPlayerIfOpen();
}

// ===== VER TABLERO DE OTRO JUGADOR =====
// Jugador cuyo tablero esta abierto en el modal (null si esta cerrado). Permite
// refrescar el contenido en vivo cuando llegan datos nuevos.
var viewingPlayerId = null;

function openViewPlayer(id) {
    var p = playersData[id];
    if (!p) { closeViewPlayer(); return; }
    viewingPlayerId = id;
    var hex = colorHexOf(p.color);
    document.getElementById('viewPlayerTitle').textContent = p.name + (id === myId ? ' (Tu)' : '');
    var container = document.getElementById('viewPlayerSheet');
    var pMoves = p.moves || [];
    container.innerHTML = buildMiniBoardHtml(pMoves) + buildMiniPenaltiesHtml(pMoves) +
        '<div style="text-align:center; margin-top:10px; font-weight:bold; color:' + hex + ';">' + (p.score || 0) + ' pts</div>';
    document.getElementById('viewPlayerModal').style.display = 'flex';
}
function closeViewPlayer() {
    viewingPlayerId = null;
    document.getElementById('viewPlayerModal').style.display = 'none';
}
function refreshViewPlayerIfOpen() {
    if (!viewingPlayerId) return;
    var modal = document.getElementById('viewPlayerModal');
    if (!modal || modal.style.display !== 'flex') { viewingPlayerId = null; return; }
    if (!playersData[viewingPlayerId]) { closeViewPlayer(); return; }
    openViewPlayer(viewingPlayerId);
}
