// ===== ICONOS: puntos de dado (SVG), casa y cartas =====
const DIE_PATTERNS = {
    1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8]
};
const PIP_POS = [
    [20, 20], [50, 20], [80, 20],
    [20, 50], [50, 50], [80, 50],
    [20, 80], [50, 80], [80, 80]
];
function pipsHTML(value) {
    if (!value) return '<span class="pip-empty">?</span>';
    const active = DIE_PATTERNS[value] || [];
    let dots = '';
    active.forEach(i => {
        const [cx, cy] = PIP_POS[i];
        dots += `<circle class="pip-dot" cx="${cx}" cy="${cy}" r="13"/><circle class="pip-shine" cx="${cx - 4}" cy="${cy - 4}" r="4"/>`;
    });
    return `<svg class="dice-svg" viewBox="0 0 100 100">${dots}</svg>`;
}
const HOUSE_SVG = '<svg class="cat-icon-svg" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M9.5 19.5V14h5v5.5"/></svg>';
let _cardsMaskSeq = 0;
function rotatePoint(x, y, cx, cy, angleDeg) {
    const rad = angleDeg * Math.PI / 180;
    const dx = x - cx, dy = y - cy;
    return [cx + dx * Math.cos(rad) - dy * Math.sin(rad), cy + dx * Math.sin(rad) + dy * Math.cos(rad)];
}
function cardsIconSVG(count) {
    const w = 6, h = 10, rx = 1.2, px = 12, py = 17;
    const frontTilt = 16;
    const spreadTable = { 2: 36, 4: 64, 5: 72 };
    const spread = spreadTable[count] || 16 * (count - 1);
    const step = count > 1 ? spread / (count - 1) : 0;
    const angles = [];
    for (let i = 0; i < count; i++) angles.push(frontTilt - spread + i * step);
    const fx = px - w / 2, fy = py - h;
    const rectAt = angle => `<rect x="${fx}" y="${fy}" width="${w}" height="${h}" rx="${rx}" transform="rotate(${angle} ${px} ${py})"/>`;
    const rectAtFill = (angle, fill) => `<rect x="${fx}" y="${fy}" width="${w}" height="${h}" rx="${rx}" transform="rotate(${angle} ${px} ${py})" fill="${fill}"/>`;

    // El abanico queda inclinado de forma asimetrica (angulos de frontTilt-spread a
    // frontTilt), asi que su contorno real no coincide con el viewBox fijo 0 0 24 24:
    // se ve corrido hacia un lado dentro de la casilla. Calculamos aqui el contorno
    // real (las 4 esquinas de cada carta, rotadas) para usarlo como viewBox y para
    // darle a la mascara una region explicita (ver mas abajo).
    const corners = [[fx, fy], [fx + w, fy], [fx, fy + h], [fx + w, fy + h]];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    angles.forEach(angle => {
        corners.forEach(([x, y]) => {
            const [rx2, ry2] = rotatePoint(x, y, px, py, angle);
            minX = Math.min(minX, rx2); maxX = Math.max(maxX, rx2);
            minY = Math.min(minY, ry2); maxY = Math.max(maxY, ry2);
        });
    });
    const pad = 1;
    const vbX = minX - pad, vbY = minY - pad, vbW = (maxX - minX) + pad * 2, vbH = (maxY - minY) + pad * 2;

    // Region explicita, generosa, para cada <mask>. Sin esto, un <mask> sin x/y/width/height
    // propios usa una region por defecto basada en porcentajes del viewport actual; al haber
    // cambiado el viewBox fijo (0 0 24 24) por uno dinamico mas chico, esa region por defecto
    // dejaba de cubrir todo el dibujo y recortaba trozos de las cartas traseras. Con una region
    // explicita mas grande que el propio viewBox, la mascara siempre cubre todo el icono.
    const maskPad = 20;
    const maskRegionAttrs = `x="${vbX - maskPad}" y="${vbY - maskPad}" width="${vbW + maskPad * 2}" height="${vbH + maskPad * 2}"`;

    // Cada carta trasera se enmascara solo donde las cartas de adelante la cubren, para que
    // las lineas de sus bordes no se vean cruzando por encima/en el centro de las cartas
    // que estan delante (tal como se penso originalmente).
    let defs = '';
    let body = '';
    for (let i = 0; i < count; i++) {
        if (i === count - 1) {
            body += rectAt(angles[i]);
            continue;
        }
        const maskId = `cardsFanMask${++_cardsMaskSeq}`;
        let coverRects = '';
        for (let j = i + 1; j < count; j++) coverRects += rectAtFill(angles[j], 'black');
        defs += `<mask id="${maskId}" maskUnits="userSpaceOnUse" ${maskRegionAttrs}><rect ${maskRegionAttrs} fill="white"/>${coverRects}</mask>`;
        body += `<g mask="url(#${maskId})">${rectAt(angles[i])}</g>`;
    }

    return `<svg class="cat-icon-svg" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" fill="none" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round">
        <defs>${defs}</defs>
        ${body}
    </svg>`;
}

function catIconHTML(cat) {
    switch (cat.iconType) {
        case 'die': return pipsHTML(cat.dieValue);
        case 'house': return HOUSE_SVG;
        case 'cards': return cardsIconSVG(cat.cardCount || 2) + `<span class="cat-sub">${cat.sub}</span>`;
        case 'yatzy': return '<span class="cat-yatzy">YATZY</span>';
        default: return `<span>${cat.icon}</span>`;
    }
}

// ===== TEMA DE COLOR POR JUGADOR =====
function myColorHex() { return colorHexOf(playerColors[myId]); }
function hexToRgba(hex, alpha) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}
function blendHex(hex, baseHex, ratio) {
    const h1 = hex.replace('#', ''), h2 = baseHex.replace('#', '');
    const r1 = parseInt(h1.substr(0, 2), 16), g1 = parseInt(h1.substr(2, 2), 16), b1 = parseInt(h1.substr(4, 2), 16);
    const r2 = parseInt(h2.substr(0, 2), 16), g2 = parseInt(h2.substr(2, 2), 16), b2 = parseInt(h2.substr(4, 2), 16);
    const r = Math.round(r1 * ratio + r2 * (1 - ratio));
    const g = Math.round(g1 * ratio + g2 * (1 - ratio));
    const b = Math.round(b1 * ratio + b2 * (1 - ratio));
    return `rgb(${r},${g},${b})`;
}
function applyBoardTheme() {
    const board = document.querySelector('.board-container');
    if (!board) return;
    const hex = myColorHex();
    const solidBg = blendHex(hex, '#1c1c26', 0.22);
    board.style.borderColor = hexToRgba(hex, 0.7);
    board.style.boxShadow = `0 0 0 1px ${hexToRgba(hex, 0.28)} inset, 0 10px 28px ${hexToRgba(hex, 0.14)}`;
    board.style.background = solidBg;
}
function readableTextOn(hex) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#1a1a1a' : '#ECE5DB';
}

// ===== RECORDATORIO DE FINALIZAR TURNO =====
// Si el jugador ya anoto un puntaje (markedThisTurn) pero no presiona "Finalizar Turno",
// le mostramos un modal con sonido para recordarselo, repitiendo el aviso si lo ignora.
const END_TURN_REMINDER_FIRST_DELAY = 10000;  // ms antes del primer aviso
const END_TURN_REMINDER_REPEAT_DELAY = 20000; // ms entre avisos si se sigue ignorando
let endTurnReminderTimer = null;

function scheduleEndTurnReminder(delay = END_TURN_REMINDER_FIRST_DELAY) {
    clearTimeout(endTurnReminderTimer);
    endTurnReminderTimer = setTimeout(() => {
        if (markedThisTurn && isMyTurn()) showEndTurnReminder();
    }, delay);
}
function cancelEndTurnReminder() {
    clearTimeout(endTurnReminderTimer);
    endTurnReminderTimer = null;
    const modal = document.getElementById('endTurnReminderModal');
    if (modal) modal.style.display = 'none';
}
function showEndTurnReminder() {
    const modal = document.getElementById('endTurnReminderModal');
    if (!modal) return;
    modal.style.display = 'flex';
    sfxReminder();
    // Si lo sigue ignorando, se lo volvemos a recordar mas adelante.
    scheduleEndTurnReminder(END_TURN_REMINDER_REPEAT_DELAY);
}
function closeEndTurnReminder() {
    const modal = document.getElementById('endTurnReminderModal');
    if (modal) modal.style.display = 'none';
}
function endTurnFromReminder() {
    cancelEndTurnReminder();
    endTurn();
}

// ===== TOAST DE EVENTOS =====
let pendingEvents = [];
// Cola de mensajes a mostrar en el toast: si llegan varios casi al mismo tiempo
// (ej. "Es tu turno" justo despues de un YATZY/BONO del jugador anterior), se
// muestran uno tras otro en vez de que el ultimo pise al que estaba en pantalla.
let toastQueue = [];
let toastShowing = false;
function queueEvent(tag, text) {
    pendingEvents = pendingEvents.filter(e => e.tag !== tag);
    pendingEvents.push({ tag, text });
}
function dequeueEvent(tag) {
    pendingEvents = pendingEvents.filter(e => e.tag !== tag);
}
function flushPendingEvents() {
    if (pendingEvents.length === 0) return;
    pendingEvents.forEach((e, i) => {
        setTimeout(() => { showEventToast(e.text); broadcastEvent(e.text); }, i * 3800);
    });
    pendingEvents = [];
}
function showEventToast(text) {
    toastQueue.push(text);
    processToastQueue();
}
function processToastQueue() {
    if (toastShowing || toastQueue.length === 0) return;
    toastShowing = true;
    const el = document.getElementById('eventToast');
    el.textContent = toastQueue.shift();
    el.classList.add('show');
    clearTimeout(showEventToast._t);
    showEventToast._t = setTimeout(() => {
        el.classList.remove('show');
        // Pequena pausa (coincide con la transicion de salida en CSS, 0.35s) antes de
        // mostrar el siguiente, para que no se corten uno al otro.
        setTimeout(() => { toastShowing = false; processToastQueue(); }, 350);
    }, 3500);
}
function broadcastEvent(text) {
    publishRoom({ action: 'event_toast', id: myId, text });
}

// ===== RENDER: TABLERO =====
function renderBoard() {
    const upperCol = document.getElementById('upperCol');
    const lowerCol = document.getElementById('lowerCol');
    upperCol.innerHTML = ''; lowerCol.innerHTML = '';

    CATEGORIES.forEach(cat => {
        const row = document.createElement('div');
        row.className = 'cat-row';
        const catCell = document.createElement('div');
        catCell.className = 'cat-cell';
        catCell.id = `cat-${cat.id}`;
        catCell.innerHTML = catIconHTML(cat);
        catCell.addEventListener('click', () => showTooltip(cat.id));
        const scoreCell = document.createElement('div');
        scoreCell.className = 'score-cell';
        scoreCell.id = `score-${cat.id}`;
        scoreCell.addEventListener('click', () => handleCategoryTap(cat.id));
        row.appendChild(catCell); row.appendChild(scoreCell);
        (cat.section === 'upper' ? upperCol : lowerCol).appendChild(row);
    });

    const bonusRow = document.createElement('div');
    bonusRow.className = 'bonus-row';
    const bonusCat = document.createElement('div');
    bonusCat.className = 'cat-cell'; bonusCat.style.flex = '1.3'; bonusCat.textContent = 'BONO';
    bonusCat.addEventListener('click', () => showTooltip('bonus'));
    const bonusCell = document.createElement('div');
    bonusCell.className = 'bonus-cell'; bonusCell.id = 'bonusCell';
    bonusRow.appendChild(bonusCat); bonusRow.appendChild(bonusCell);
    upperCol.appendChild(bonusRow);
}

function renderDice() {
    const row = document.getElementById('diceRow');
    if (!row) return;
    row.innerHTML = '';
    const interactive = isMyTurn() && !markedThisTurn;
    myDice.forEach((val, idx) => {
        const cell = document.createElement('div');
        cell.className = 'die-cell' + (val ? ' filled' : '') + (!interactive ? ' disabled' : '');
        cell.innerHTML = pipsHTML(val);
        cell.addEventListener('click', () => tapDiceCell(idx));
        row.appendChild(cell);
    });
}

function renderScores() {
    const diceReady = myDice.every(d => d !== null);
    const myTurn = isMyTurn();
    const eligible = jokerModeActive ? jokerEligibleCategories() : [];

    CATEGORIES.forEach(cat => {
        const cell = document.getElementById(`score-${cat.id}`);
        if (!cell) return;
        cell.classList.remove('ghost', 'locked', 'disabled-turn', 'yatzy-again', 'joker-eligible', 'undoable');
        cell.style.outlineColor = '';
        cell.style.borderColor = '';
        cell.style.background = '';
        cell.style.color = '';
        cell.innerHTML = '';

        const lockedVal = myScores[cat.id];
        if (lockedVal !== null) {
            cell.textContent = lockedVal;
            cell.classList.add('locked');
            const myColor = myColorHex();
            cell.style.background = myColor;
            cell.style.borderColor = myColor;
            cell.style.color = readableTextOn(myColor);
            if (markedThisTurn && cat.id === lastMarkedCatId) {
                cell.classList.add('undoable');
                cell.style.outlineColor = myColorHex();
            }
            if (jokerModeActive && cat.id === 'yatzy') {
                cell.classList.add('undoable');
                cell.style.outlineColor = myColorHex();
            }
        } else {
            if (!gameStarted) {
                cell.classList.add('disabled-turn');
            } else if (jokerModeActive) {
                if (eligible.includes(cat.id)) {
                    cell.classList.add('joker-eligible');
                    const jokerFixed = { fullHouse: 25, smallStraight: 30, largeStraight: 40 };
                    const previewVal = jokerFixed[cat.id] !== undefined ? jokerFixed[cat.id] : cat.calc(myDice);
                    cell.textContent = previewVal;
                } else cell.classList.add('disabled-turn');
            } else if (myTurn && diceReady && !markedThisTurn) {
                const preview = cat.calc(myDice);
                cell.textContent = preview;
                cell.classList.add('ghost');
                if (cat.id === 'yatzy' && isYatzy(myDice)) cell.classList.add('yatzy-again');
            } else {
                cell.classList.add('disabled-turn');
            }
        }
    });

    const yatzyCell = document.getElementById('score-yatzy');
    if (yatzyCell && myScores.yatzy !== null && myTurn && !markedThisTurn && !jokerModeActive && diceReady && isYatzy(myDice)) {
        yatzyCell.classList.add('yatzy-again');
    }

    const catYatzyCell = document.getElementById('cat-yatzy');
    if (catYatzyCell) {
        const existing = catYatzyCell.querySelector('.yatzy-checks');
        if (existing) existing.remove();
        if (myExtraYatzys > 0) {
            const checks = document.createElement('div');
            checks.className = 'yatzy-checks';
            checks.textContent = `x${myExtraYatzys}`;
            catYatzyCell.appendChild(checks);
        }
    }

    updateBonusCell();
    updateTotalScore();
    updateEndTurnButton();
    checkGameFinished();
    applyBoardTheme();
    updateStartButton();
}

function updateBonusCell() {
    const cell = document.getElementById('bonusCell');
    if (!cell) return;
    const sum = upperSum(myScores);
    if (sum >= 63) { cell.innerHTML = '+35\n✓'; cell.classList.add('done'); }
    else { cell.innerHTML = `${sum}\n/63`; cell.classList.remove('done'); }
}
function updateTotalScore() {
    const el = document.getElementById('myTotalScore');
    if (el) el.textContent = totalScore(myScores, myExtraYatzys);
}

function renderTurnBanner() {
    const banner = document.getElementById('turnBanner');
    const resetBtn = document.getElementById('resetGameBtn');
    if (resetBtn) resetBtn.style.display = (isRoomCreator && gameStarted && currentRoom) ? 'block' : 'none';
    updateStartButton();
    if (!banner) return;
    if (!gameStarted) {
        banner.textContent = 'Esperando inicio...';
        banner.classList.remove('my-turn');
        return;
    }
    if (turnOrder.length === 0) { banner.textContent = ''; banner.classList.remove('my-turn'); return; }
    const currentId = turnOrder[currentTurnIndex];
    const currentName = (playersData[currentId] && playersData[currentId].name) || (currentId === myId ? myName : '??');
    if (currentId === myId) { banner.textContent = 'Tu turno — lanza los dados y anota'; banner.classList.add('my-turn'); }
    else { banner.textContent = `Turno de: ${currentName}`; banner.classList.remove('my-turn'); }
    updateEndTurnButton();
}

// ===== BOTÓN DE INICIO (dinámico) =====
function updateStartButton() {
    const btn = document.getElementById('startGameBtn');
    if (!btn) return;
    const visible = isRoomCreator && !gameStarted && currentRoom;
    btn.style.display = visible ? 'block' : 'none';
    btn.disabled = !visible;
}

function updateEndTurnButton() {
    const btn = document.getElementById('endTurnBtn');
    if (!btn) return;
    const enabled = isMyTurn() && markedThisTurn;
    btn.disabled = !enabled;
}

// ===== TOOLTIPS =====
function showTooltip(id) {
    let title, text;
    if (id === 'bonus') { title = 'BONO'; text = TOOLTIP_TEXT.bonus; }
    else { const cat = CATEGORIES.find(c => c.id === id); title = cat.label; text = TOOLTIP_TEXT[id]; }
    document.getElementById('tooltipTitle').textContent = title;
    document.getElementById('tooltipText').textContent = text;
    document.getElementById('tooltipModal').style.display = 'flex';
}
function closeTooltip() { document.getElementById('tooltipModal').style.display = 'none'; }

// ===== DADOS =====
function tapDiceCell(index) {
    if (!isMyTurn() || markedThisTurn) return;
    primeAudio();
    sfxButton();
    activeDiceIndex = index;
    document.getElementById('diceModal').style.display = 'flex';
}
function setDiceValue(val) {
    if (activeDiceIndex === null) return;
    myDice[activeDiceIndex] = val;
    const idx = activeDiceIndex;
    activeDiceIndex = null;
    document.getElementById('diceModal').style.display = 'none';
    renderDice(); renderScores();
    sfxDiceTap();
    const row = document.getElementById('diceRow');
    if (row && row.children[idx]) {
        const cell = row.children[idx];
        cell.classList.remove('pop-anim');
        void cell.offsetWidth;
        cell.classList.add('pop-anim');
    }
}
function closeDiceModal() { activeDiceIndex = null; document.getElementById('diceModal').style.display = 'none'; }

// ===== FIN DE LA PARTIDA =====
function showGameOverModal() {
    const arr = turnOrder.map(id => ({ id, ...playersData[id] })).sort((a, b) => (b.score || 0) - (a.score || 0));
    const list = document.getElementById('finalRankList');
    if (list) {
        list.innerHTML = arr.map((p, idx) => {
            const hex = colorHexOf(p.color);
            const isWinner = idx === 0;
            const medal = idx === 0 ? '🏆' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
            return `<div class="final-rank-row${isWinner ? ' winner' : ''}" style="border-left-color:${hex};">
                <span class="frank-medal">${medal}</span>
                <span class="frank-name">${p.name}${p.id === myId ? ' (Tu)' : ''}</span>
                <span class="frank-score">${p.score || 0}</span>
            </div>`;
        }).join('');
    }
    const resetBtn = document.getElementById('gameOverResetBtn');
    if (resetBtn) resetBtn.style.display = isRoomCreator ? 'block' : 'none';
    const modal = document.getElementById('gameOverModal');
    if (modal) modal.style.display = 'flex';
    sfxWin();
}
function closeGameOverModal() {
    document.getElementById('gameOverModal').style.display = 'none';
}

// Jugador cuya cartilla esta abierta en el modal de "ver cartilla" (null si esta cerrado).
// Permite refrescar el contenido en vivo cada vez que llegan datos nuevos, sin que el
// usuario tenga que cerrar y volver a abrir el modal para ver los cambios.
let viewingPlayerId = null;

function openViewPlayer(id) {
    const p = playersData[id];
    if (!p) { closeViewPlayer(); return; }
    viewingPlayerId = id;
    document.getElementById('viewPlayerTitle').textContent = `${p.name}${id === myId ? ' (Tu)' : ''}`;
    const scores = p.scores || {};
    const hex = colorHexOf(p.color);
    const container = document.getElementById('viewPlayerSheet');
    container.innerHTML = '';

    const board = document.createElement('div');
    board.className = 'yatzy-board mini-board';
    const upperCol = document.createElement('div'); upperCol.className = 'yatzy-col';
    const lowerCol = document.createElement('div'); lowerCol.className = 'yatzy-col';
    board.appendChild(upperCol); board.appendChild(lowerCol);

    function buildMiniCol(section, col) {
        CATEGORIES.filter(c => c.section === section).forEach(cat => {
            const row = document.createElement('div');
            row.className = 'cat-row';
            const catCell = document.createElement('div');
            catCell.className = 'cat-cell';
            catCell.innerHTML = catIconHTML(cat);
            const scoreCell = document.createElement('div');
            scoreCell.className = 'score-cell';
            const val = scores[cat.id];
            if (val !== null && val !== undefined) {
                scoreCell.classList.add('locked');
                scoreCell.style.background = hex;
                scoreCell.style.borderColor = hex;
                scoreCell.style.color = readableTextOn(hex);
                scoreCell.textContent = val;
            } else {
                scoreCell.classList.add('disabled-turn');
            }
            row.appendChild(catCell); row.appendChild(scoreCell);
            col.appendChild(row);
        });
    }
    buildMiniCol('upper', upperCol);
    buildMiniCol('lower', lowerCol);

    const bonusRow = document.createElement('div');
    bonusRow.className = 'bonus-row';
    const bonusCat = document.createElement('div');
    bonusCat.className = 'cat-cell'; bonusCat.style.flex = '1.15'; bonusCat.textContent = 'BONO';
    const bonusCell = document.createElement('div');
    bonusCell.className = 'bonus-cell';
    const uSum = upperSum(scores);
    if (uSum >= 63) { bonusCell.innerHTML = '+35<br>✓'; bonusCell.classList.add('done'); }
    else { bonusCell.innerHTML = `${uSum}<br>/63`; }
    bonusRow.appendChild(bonusCat); bonusRow.appendChild(bonusCell);
    upperCol.appendChild(bonusRow);

    container.appendChild(board);

    if (p.extraYatzys) {
        const extra = document.createElement('p');
        extra.style.cssText = 'text-align:center;font-size:0.75rem;color:#EBC21A;margin-top:8px;';
        extra.textContent = `⭐ Yatzys extra: ${p.extraYatzys} (+${p.extraYatzys * 100})`;
        container.appendChild(extra);
    }

    document.getElementById('viewPlayerModal').style.display = 'flex';
}
function closeViewPlayer() {
    viewingPlayerId = null;
    document.getElementById('viewPlayerModal').style.display = 'none';
}

// Se llama cada vez que llegan datos nuevos de jugadores (leaderboard.js). Si el modal
// de "ver cartilla" esta abierto, lo reconstruye con los datos actuales; si el jugador
// que se estaba viendo ya no existe (lo removieron), simplemente lo cierra.
function refreshViewPlayerIfOpen() {
    if (!viewingPlayerId) return;
    const modal = document.getElementById('viewPlayerModal');
    if (!modal || modal.style.display !== 'flex') { viewingPlayerId = null; return; }
    if (!playersData[viewingPlayerId]) { closeViewPlayer(); return; }
    openViewPlayer(viewingPlayerId);
}

// ===== AVISO GENERAL =====
function showNotice(text, title = 'Aviso') {
    document.getElementById('noticeTitle').textContent = title;
    document.getElementById('noticeText').textContent = text;
    document.getElementById('noticeModal').style.display = 'flex';
}
function closeNotice() { document.getElementById('noticeModal').style.display = 'none'; }

// ===== FUNCIONES FALTANTES =====

function closeResetGameModal() {
    document.getElementById('resetGameModal').style.display = 'none';
}

// closeRemovePlayerModal y confirmRemovePlayer viven en turnos.js (junto con el
// resto de la logica de eliminacion de jugadores), no aca.
