// ===== CONFIGURACION DE CATEGORIAS =====
function countsOf(dice) {
    const c = [0, 0, 0, 0, 0, 0, 0];
    dice.forEach(d => c[d]++);
    return c;
}
function sumAll(dice) { return dice.reduce((a, b) => a + b, 0); }
function sumOfNumber(dice, n) { return dice.filter(d => d === n).length * n; }
function hasCountAtLeast(dice, n) { return countsOf(dice).some(c => c >= n); }
function isFullHouse(dice) {
    const c = countsOf(dice).filter(x => x > 0);
    return c.length === 2 && c.includes(3) && c.includes(2);
}
function isSmallStraight(dice) {
    const set = new Set(dice);
    return [[1,2,3,4],[2,3,4,5],[3,4,5,6]].some(seq => seq.every(n => set.has(n)));
}
function isLargeStraight(dice) {
    const set = new Set(dice);
    return [[1,2,3,4,5],[2,3,4,5,6]].some(seq => seq.every(n => set.has(n)) && set.size === 5);
}
function isYatzy(dice) { return dice.every(d => d === dice[0]); }

const CATEGORIES = [
    { id: 'ones',   section: 'upper', label: 'Unos',    iconType: 'die', dieValue: 1, calc: d => sumOfNumber(d, 1) },
    { id: 'twos',   section: 'upper', label: 'Doses',   iconType: 'die', dieValue: 2, calc: d => sumOfNumber(d, 2) },
    { id: 'threes', section: 'upper', label: 'Treses',  iconType: 'die', dieValue: 3, calc: d => sumOfNumber(d, 3) },
    { id: 'fours',  section: 'upper', label: 'Cuatros', iconType: 'die', dieValue: 4, calc: d => sumOfNumber(d, 4) },
    { id: 'fives',  section: 'upper', label: 'Cincos',  iconType: 'die', dieValue: 5, calc: d => sumOfNumber(d, 5) },
    { id: 'sixes',  section: 'upper', label: 'Seises',  iconType: 'die', dieValue: 6, calc: d => sumOfNumber(d, 6) },
    { id: 'threeKind',     section: 'lower', label: '3 del mismo número',    iconType: 'text', icon: '3X',  calc: d => hasCountAtLeast(d, 3) ? sumAll(d) : 0 },
    { id: 'fourKind',      section: 'lower', label: '4 del mismo número',    iconType: 'text', icon: '4X',  calc: d => hasCountAtLeast(d, 4) ? sumAll(d) : 0 },
    { id: 'fullHouse',     section: 'lower', label: 'Full (3+2)',            iconType: 'house', calc: d => isFullHouse(d) ? 25 : 0 },
    { id: 'smallStraight', section: 'lower', label: 'Secuencia de 4',        iconType: 'cards', sub: 'SMALL', calc: d => isSmallStraight(d) ? 30 : 0 },
    { id: 'largeStraight', section: 'lower', label: 'Secuencia de 5',        iconType: 'cards', sub: 'LARGE', calc: d => isLargeStraight(d) ? 40 : 0 },
    { id: 'yatzy',         section: 'lower', label: 'Yatzy (5 iguales)',     iconType: 'yatzy', calc: d => isYatzy(d) ? 50 : 0 },
    { id: 'chance',        section: 'lower', label: 'Probabilidad',         iconType: 'text', icon: '?', calc: d => sumAll(d) }
];

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
const CARDS_SVG = '<svg class="cat-icon-svg" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="7" width="12" height="15" rx="2" transform="rotate(-12 8.5 14.5)"/><rect x="8" y="3" width="12" height="15" rx="2"/></svg>';

function catIconHTML(cat) {
    switch (cat.iconType) {
        case 'die': return pipsHTML(cat.dieValue);
        case 'house': return HOUSE_SVG;
        case 'cards': return CARDS_SVG + `<span class="cat-sub">${cat.sub}</span>`;
        case 'yatzy': return '<span class="cat-yatzy">YATZY</span>';
        default: return `<span>${cat.icon}</span>`;
    }
}

const TOOLTIP_TEXT = {
    ones: 'Cuenta y suma solo los números uno.',
    twos: 'Cuenta y suma solo los números dos.',
    threes: 'Cuenta y suma solo los números tres.',
    fours: 'Cuenta y suma solo los números cuatro.',
    fives: 'Cuenta y suma solo los números cinco.',
    sixes: 'Cuenta y suma solo los números seis.',
    threeKind: 'Suma el total de todos los dados.',
    fourKind: 'Suma el total de todos los dados.',
    fullHouse: 'Puntuación fija: 25 (3 del mismo número y 2 del mismo número).',
    smallStraight: 'Puntuación fija: 30 (secuencia de 4 números consecutivos).',
    largeStraight: 'Puntuación fija: 40 (secuencia de 5 números consecutivos).',
    yatzy: 'Puntuación fija: 50 (5 dados con el mismo número).',
    chance: 'Suma cualquier combinación de los 5 dados.',
    bonus: 'Anota al menos 63 puntos en tu lado superior y obtén 35 puntos extra.'
};

const PLAYER_COLORS = [
    { id: 'rojo', hex: '#C7403F' },
    { id: 'azul', hex: '#4A6FA5' },
    { id: 'verde_oscuro', hex: '#265F56' },
    { id: 'amarillo', hex: '#D6A518' },
    { id: 'rosado', hex: '#E0729A' },
    { id: 'naranja', hex: '#D9822B' },
    { id: 'morado', hex: '#8B5FBF' },
    { id: 'celeste', hex: '#5BC0DE' },
    { id: 'lila', hex: '#B39DDB' },
    { id: 'verde_limon', hex: '#9CCC65' }
];
function colorHexOf(colorId) {
    const found = PLAYER_COLORS.find(c => c.id === colorId);
    return found ? found.hex : '#808BC3';
}
function myColorHex() { return colorHexOf(playerColors[myId]); }

function emptyScores() {
    const s = {};
    CATEGORIES.forEach(c => s[c.id] = null);
    return s;
}
function upperSum(scores) {
    return ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes']
        .reduce((sum, id) => sum + (scores[id] || 0), 0);
}
function upperBonus(scores) { return upperSum(scores) >= 63 ? 35 : 0; }
function lowerSum(scores) {
    return ['threeKind', 'fourKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yatzy', 'chance']
        .reduce((sum, id) => sum + (scores[id] || 0), 0);
}
function totalScore(scores, extraYatzys) {
    return upperSum(scores) + upperBonus(scores) + lowerSum(scores) + (extraYatzys || 0) * 100;
}

// ===== ESTADO DEL JUGADOR =====
let myName = "Jugador";
let myId = Math.random().toString(36).substr(2, 9);
let myScores = emptyScores();
let myExtraYatzys = 0;
let myBonusAnnounced = false;
let myDice = [null, null, null, null, null];
let activeDiceIndex = null;
let markedThisTurn = false;
let jokerModeActive = false;
let lastMarkedCatId = null;
let lastMarkedWasJoker = false;

// ===== ESTADO DE LA SALA / TURNOS =====
let mqttClient = null;
let currentRoom = null;
let playersData = {};
let isRoomCreator = false;
let pendingOrder = [];
let turnOrder = [];
let playerColors = {};
let currentTurnIndex = 0;
let gameStarted = false;

function isMyTurn() {
    return gameStarted && turnOrder.length > 0 && turnOrder[currentTurnIndex] === myId;
}

// ===== PERSISTENCIA (RECONEXION MISMO DISPOSITIVO) =====
const SESSION_KEY = 'yatzy_session_v1';
const REGISTRY_KEY = 'yatzy_players_v1';
let claimResolved = false;
let pendingClaim = null;

function persistSession() {
    if (!currentRoom) return;
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify({
            roomCode: currentRoom, myId, myName, scores: myScores, extraYatzys: myExtraYatzys, updatedAt: Date.now()
        }));
    } catch (e) { console.error("No se pudo guardar la sesion", e); }
}
function loadSession() {
    try { const raw = localStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}
function clearSession() { try { localStorage.removeItem(SESSION_KEY); } catch (e) {} }

function registryKey(room, name) { return `${room}::${name}`; }
function loadRegistry() {
    try { const raw = localStorage.getItem(REGISTRY_KEY); return raw ? JSON.parse(raw) : {}; } catch (e) { return {}; }
}
function persistRegistry() {
    if (!currentRoom) return;
    try {
        const registry = loadRegistry();
        registry[registryKey(currentRoom, myName)] = { id: myId, scores: myScores, extraYatzys: myExtraYatzys, updatedAt: Date.now() };
        localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
    } catch (e) { console.error("No se pudo guardar el registro de jugador", e); }
}
function getRegistryEntry(room, name) {
    const registry = loadRegistry();
    return registry[registryKey(room, name)] || null;
}

// ===== LOG COMPARTIDO =====
let gameLog = [];
let seenLogIds = new Set();
const LOG_MAX_ENTRIES = 300;

function logMove(kind, payload) {
    const entry = {
        logId: `${myId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        ts: Date.now(), playerName: myName, kind, ...payload
    };
    addLogEntry(entry, true);
}
function addLogEntry(entry, shouldBroadcast) {
    if (!entry || seenLogIds.has(entry.logId)) return;
    seenLogIds.add(entry.logId);
    gameLog.push(entry);
    if (gameLog.length > LOG_MAX_ENTRIES) gameLog.splice(0, gameLog.length - LOG_MAX_ENTRIES);
    renderLog();
    if (shouldBroadcast && currentRoom && mqttClient) {
        mqttClient.publish(`yatzy_app_xyz/room/${currentRoom}`, JSON.stringify({ action: 'log_entry', id: myId, entry }));
    }
}
function renderLog() {
    const el = document.getElementById('gameLogList');
    if (!el) return;
    if (gameLog.length === 0) { el.innerHTML = '<p class="log-empty">Sin movimientos todavia.</p>'; return; }
    el.innerHTML = gameLog.slice().reverse().map(e => {
        const time = new Date(e.ts).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        let verb, targetHtml = '';
        if (e.kind === 'score') {
            const cat = CATEGORIES.find(c => c.id === e.catId);
            if (e.action === 'unmark') {
                verb = 'deshizo su anotación en';
                targetHtml = `<span class="log-target">${cat ? cat.label : e.catId}</span>`;
            } else {
                verb = e.auto ? 'anotó (comodín)' : 'anotó';
                targetHtml = `<span class="log-target">${cat ? cat.label : e.catId}: ${e.value}</span>`;
            }
        } else if (e.kind === 'yatzy_extra') {
            if (e.action === 'undo') { verb = 'deshizo su Yatzy extra (-100)'; }
            else { verb = 'logró un YATZY EXTRA'; targetHtml = '<span class="log-target">+100</span>'; }
        } else if (e.kind === 'end_turn') {
            verb = 'finalizó su turno';
        } else if (e.kind === 'reset') {
            verb = 'reinició la partida para todos';
        } else return '';
        return `<div class="log-entry"><span class="log-time">${time}</span><span class="log-player">${e.playerName}</span><span class="log-verb">${verb}</span>${targetHtml}</div>`;
    }).join('');
}

// ===== TOAST DE EVENTOS =====
function showEventToast(text) {
    const el = document.getElementById('eventToast');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(showEventToast._t);
    showEventToast._t = setTimeout(() => el.classList.remove('show'), 3500);
}
function broadcastEvent(text) {
    if (mqttClient && currentRoom) {
        mqttClient.publish(`yatzy_app_xyz/room/${currentRoom}`, JSON.stringify({ action: 'event_toast', id: myId, text }));
    }
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

function jokerEligibleCategories() {
    if (!myDice.every(d => d !== null) || !isYatzy(myDice)) return [];
    const upperIdMap = { 1: 'ones', 2: 'twos', 3: 'threes', 4: 'fours', 5: 'fives', 6: 'sixes' };
    const upperId = upperIdMap[myDice[0]];
    let eligible = [];
    if (myScores[upperId] === null) eligible.push(upperId);
    else ['fullHouse', 'smallStraight', 'largeStraight'].forEach(id => { if (myScores[id] === null) eligible.push(id); });
    if (eligible.length === 0) CATEGORIES.forEach(c => { if (myScores[c.id] === null) eligible.push(c.id); });
    return eligible;
}

function renderScores() {
    const diceReady = myDice.every(d => d !== null);
    const myTurn = isMyTurn();
    const eligible = jokerModeActive ? jokerEligibleCategories() : [];

    CATEGORIES.forEach(cat => {
        const cell = document.getElementById(`score-${cat.id}`);
        if (!cell) return;
        cell.classList.remove('ghost', 'locked', 'disabled-turn', 'yatzy-again', 'joker-eligible', 'undoable');
        cell.style.borderColor = '';
        cell.innerHTML = '';

        const lockedVal = myScores[cat.id];
        if (lockedVal !== null) {
            cell.textContent = lockedVal;
            cell.classList.add('locked');
            cell.style.borderColor = myColorHex();
            if (markedThisTurn && cat.id === lastMarkedCatId) cell.classList.add('undoable');
            if (jokerModeActive && cat.id === 'yatzy') cell.classList.add('undoable');
            if (cat.id === 'yatzy' && myExtraYatzys > 0) {
                const checks = document.createElement('div');
                checks.className = 'yatzy-checks';
                checks.textContent = '✔'.repeat(Math.min(myExtraYatzys, 6));
                cell.appendChild(checks);
            }
        } else {
            if (jokerModeActive) {
                if (eligible.includes(cat.id)) cell.classList.add('joker-eligible');
                else cell.classList.add('disabled-turn');
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

    // Casilla de Yatzy ya llena + dados actuales tambien Yatzy -> ofrecer extra
    const yatzyCell = document.getElementById('score-yatzy');
    if (yatzyCell && myScores.yatzy !== null && myTurn && !markedThisTurn && !jokerModeActive && diceReady && isYatzy(myDice)) {
        yatzyCell.classList.add('yatzy-again');
    }

    updateBonusCell();
    updateTotalScore();
    renderTurnActions();
}

function updateBonusCell() {
    const cell = document.getElementById('bonusCell');
    if (!cell) return;
    const sum = upperSum(myScores);
    if (sum >= 63) { cell.innerHTML = '+35<br>✓'; cell.classList.add('done'); }
    else { cell.innerHTML = `${sum}<br>/63`; cell.classList.remove('done'); }
}
function updateTotalScore() {
    const el = document.getElementById('myTotalScore');
    if (el) el.textContent = totalScore(myScores, myExtraYatzys);
}
function renderTurnActions() {
    const el = document.getElementById('turnActions');
    if (el) el.style.display = (isMyTurn() && markedThisTurn) ? 'flex' : 'none';
}
function renderTurnBanner() {
    const banner = document.getElementById('turnBanner');
    const resetBtn = document.getElementById('resetGameBtn');
    if (resetBtn) resetBtn.style.display = (isRoomCreator && gameStarted && currentRoom) ? 'block' : 'none';
    if (!banner) return;
    if (!gameStarted || turnOrder.length === 0) { banner.textContent = ''; banner.classList.remove('my-turn'); return; }
    const currentId = turnOrder[currentTurnIndex];
    const currentName = (playersData[currentId] && playersData[currentId].name) || (currentId === myId ? myName : '??');
    if (currentId === myId) { banner.textContent = 'Tu turno — lanza los dados y anota'; banner.classList.add('my-turn'); }
    else { banner.textContent = `Turno de: ${currentName}`; banner.classList.remove('my-turn'); }
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
    activeDiceIndex = index;
    document.getElementById('diceModal').style.display = 'flex';
}
function setDiceValue(val) {
    if (activeDiceIndex === null) return;
    myDice[activeDiceIndex] = val;
    activeDiceIndex = null;
    document.getElementById('diceModal').style.display = 'none';
    renderDice(); renderScores();
}
function closeDiceModal() { activeDiceIndex = null; document.getElementById('diceModal').style.display = 'none'; }

// ===== ANOTAR CATEGORIA =====
function handleCategoryTap(catId) {
    if (!gameStarted || !isMyTurn()) return;

    if (jokerModeActive) {
        // Deshacer el Yatzy extra antes de elegir donde usar el comodin (toca la casilla de Yatzy otra vez)
        if (catId === 'yatzy') { undoExtraYatzy(); return; }
        if (myScores[catId] !== null) return;
        const eligible = jokerEligibleCategories();
        if (!eligible.includes(catId)) return;
        const jokerFixed = { fullHouse: 25, smallStraight: 30, largeStraight: 40 };
        const value = jokerFixed[catId] !== undefined ? jokerFixed[catId] : CATEGORIES.find(c => c.id === catId).calc(myDice);
        lockCategory(catId, value, { joker: true });
        return;
    }

    if (markedThisTurn) {
        // Deshacer: toca de nuevo la misma casilla que acabas de anotar este turno.
        if (catId === lastMarkedCatId) undoLastCategory();
        return;
    }

    if (myScores[catId] === null) {
        if (!myDice.every(d => d !== null)) return;
        lockCategory(catId, CATEGORIES.find(c => c.id === catId).calc(myDice));
    } else if (catId === 'yatzy' && myDice.every(d => d !== null) && isYatzy(myDice)) {
        document.getElementById('yatzyExtraModal').style.display = 'flex';
    }
}

function undoLastCategory() {
    if (!lastMarkedCatId) return;
    const wasJoker = lastMarkedWasJoker;
    const catId = lastMarkedCatId;
    myScores[catId] = null;
    logMove('score', { catId, action: 'unmark' });
    lastMarkedCatId = null;
    lastMarkedWasJoker = false;
    markedThisTurn = false;
    if (wasJoker) jokerModeActive = true; // vuelve a ofrecer las casillas de comodin para elegir de nuevo
    saveState();
    renderDice(); renderScores();
}

function undoExtraYatzy() {
    if (myExtraYatzys <= 0) return;
    myExtraYatzys--;
    jokerModeActive = false;
    logMove('yatzy_extra', { action: 'undo' });
    saveState();
    renderScores();
}

function lockCategory(catId, value, opts = {}) {
    myScores[catId] = value;
    markedThisTurn = true;
    jokerModeActive = false;
    lastMarkedCatId = catId;
    lastMarkedWasJoker = !!opts.joker;
    logMove('score', { catId, value, auto: !!opts.joker });

    if (catId === 'yatzy' && value === 50) {
        const msg = `⭐ ${myName} hizo YATZY! (+50)`;
        showEventToast(msg); broadcastEvent(msg);
    }
    saveState();
    checkBonusJustCompleted();
    renderDice(); renderScores();
}

function checkBonusJustCompleted() {
    if (!myBonusAnnounced && upperBonus(myScores) === 35) {
        myBonusAnnounced = true;
        const msg = `🎉 ${myName} consiguió el BONO +35!`;
        showEventToast(msg); broadcastEvent(msg);
    }
}

function declineYatzyExtra() { document.getElementById('yatzyExtraModal').style.display = 'none'; }
function acceptYatzyExtra() {
    document.getElementById('yatzyExtraModal').style.display = 'none';
    myExtraYatzys++;
    logMove('yatzy_extra', {});
    const msg = `⭐⭐ ${myName} logró otro YATZY! +100 bono`;
    showEventToast(msg); broadcastEvent(msg);
    jokerModeActive = true;
    saveState();
    renderScores();
}

// ===== GUARDAR / SINCRONIZAR ESTADO =====
function saveState() {
    updateTotalScore();
    if (currentRoom) {
        playersData[myId] = { name: myName, color: playerColors[myId] || null, scores: { ...myScores }, extraYatzys: myExtraYatzys, score: totalScore(myScores, myExtraYatzys) };
        renderLeaderboard();
        broadcastSync();
        persistSession();
        persistRegistry();
    }
}
function broadcastSync(action = 'sync') {
    if (mqttClient && currentRoom) {
        mqttClient.publish(`yatzy_app_xyz/room/${currentRoom}`, JSON.stringify({
            action, id: myId, name: myName, color: playerColors[myId] || null,
            scores: myScores, extraYatzys: myExtraYatzys, score: totalScore(myScores, myExtraYatzys)
        }));
    }
}

// ===== LEADERBOARD =====
function renderLeaderboard() {
    const list = document.getElementById('playersList');
    if (!list) return;
    list.innerHTML = '';
    const arr = Object.keys(playersData).map(id => ({ id, ...playersData[id] })).sort((a, b) => (b.score || 0) - (a.score || 0));
    arr.forEach(p => {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.style.borderLeftColor = colorHexOf(p.color);
        const isTurn = gameStarted && turnOrder[currentTurnIndex] === p.id;
        card.innerHTML = `
            <span class="pc-name">
                <span style="width:10px;height:10px;border-radius:50%;background:${colorHexOf(p.color)};display:inline-block;"></span>
                ${p.name}${p.id === myId ? ' (Tu)' : ''}${isTurn ? '<span class="pc-turn-tag">TURNO</span>' : ''}
            </span>
            <span class="pc-score">${p.score || 0}</span>`;
        card.addEventListener('click', () => openViewPlayer(p.id));
        list.appendChild(card);
    });
}

function openViewPlayer(id) {
    const p = playersData[id];
    if (!p) return;
    document.getElementById('viewPlayerTitle').textContent = `${p.name}${id === myId ? ' (Tu)' : ''}`;
    const scores = p.scores || {};
    const colorHex = colorHexOf(p.color);
    const rowHtml = c => {
        const val = scores[c.id];
        const has = val !== null && val !== undefined;
        return `<div style="display:flex;justify-content:space-between;padding:6px 8px;border-radius:6px;background:#2a2a2a;${has ? `border:2px solid ${colorHex};` : ''}">
            <span>${c.label}</span><b>${has ? val : '-'}</b></div>`;
    };
    let html = '<div style="flex:1;display:flex;flex-direction:column;gap:4px;">';
    CATEGORIES.filter(c => c.section === 'upper').forEach(c => html += rowHtml(c));
    const bonus = upperBonus(scores);
    html += `<div style="display:flex;justify-content:space-between;padding:6px 8px;border-radius:6px;background:#2a2a2a;">
        <span>BONO</span><b>${bonus === 35 ? '+35 ✓' : `${upperSum(scores)}/63`}</b></div></div>`;
    html += '<div style="flex:1;display:flex;flex-direction:column;gap:4px;">';
    CATEGORIES.filter(c => c.section === 'lower').forEach(c => html += rowHtml(c));
    if (p.extraYatzys) html += `<div style="text-align:center;font-size:0.75rem;color:#EBC21A;margin-top:4px;">⭐ Yatzys extra: ${p.extraYatzys} (+${p.extraYatzys * 100})</div>`;
    html += '</div>';
    document.getElementById('viewPlayerSheet').innerHTML = html;
    document.getElementById('viewPlayerModal').style.display = 'flex';
}
function closeViewPlayer() { document.getElementById('viewPlayerModal').style.display = 'none'; }

// ===== SALA DE ESPERA / ORDEN DE TURNOS =====
function renderPreGame() {
    const panel = document.getElementById('preGamePanel');
    const gameArea = document.getElementById('gameArea');
    if (!panel || !gameArea) return;

    if (gameStarted) { panel.style.display = 'none'; gameArea.style.display = 'flex'; return; }
    panel.style.display = 'block'; gameArea.style.display = 'none';

    const currentIds = Object.keys(playersData);
    currentIds.forEach(id => { if (!pendingOrder.includes(id)) pendingOrder.push(id); });
    pendingOrder = pendingOrder.filter(id => currentIds.includes(id));

    const list = document.getElementById('orderList');
    list.innerHTML = '';
    pendingOrder.forEach((id, idx) => {
        const p = playersData[id];
        if (!p) return;
        const hex = PLAYER_COLORS[idx % PLAYER_COLORS.length].hex;
        const row = document.createElement('div');
        row.className = 'order-row';
        row.style.borderLeftColor = hex;
        row.innerHTML = `<span class="order-color-dot" style="background:${hex}"></span>
            <span class="order-name">${idx + 1}. ${p.name}${id === myId ? ' (Tu)' : ''}</span>`;
        if (isRoomCreator) {
            const arrows = document.createElement('div');
            arrows.className = 'order-arrows';
            const up = document.createElement('button');
            up.className = 'order-arrow-btn'; up.textContent = '▲'; up.disabled = idx === 0;
            up.addEventListener('click', () => moveOrder(idx, -1));
            const down = document.createElement('button');
            down.className = 'order-arrow-btn'; down.textContent = '▼'; down.disabled = idx === pendingOrder.length - 1;
            down.addEventListener('click', () => moveOrder(idx, 1));
            arrows.appendChild(up); arrows.appendChild(down);
            row.appendChild(arrows);
        }
        list.appendChild(row);
    });

    document.getElementById('preGameHint').textContent = isRoomCreator
        ? 'Ordena a los jugadores (▲▼) y presiona Iniciar cuando esten todos.'
        : 'Esperando a que el anfitrion inicie la partida...';
    document.getElementById('startGameBtn').style.display = isRoomCreator ? 'block' : 'none';
}
function moveOrder(idx, dir) {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= pendingOrder.length) return;
    [pendingOrder[idx], pendingOrder[newIdx]] = [pendingOrder[newIdx], pendingOrder[idx]];
    renderPreGame();
}

function startGame() {
    if (!isRoomCreator || pendingOrder.length === 0) return;
    turnOrder = [...pendingOrder];
    const colors = {};
    turnOrder.forEach((id, idx) => { colors[id] = PLAYER_COLORS[idx % PLAYER_COLORS.length].id; });
    playerColors = colors;
    Object.keys(playersData).forEach(id => { if (playersData[id]) playersData[id].color = colors[id]; });
    currentTurnIndex = 0;
    gameStarted = true;
    broadcastGameStart();
    afterTurnBecameMine();
    renderPreGame(); renderTurnBanner(); renderDice(); renderScores(); renderLeaderboard();
    saveState();
}
function broadcastGameStart() {
    if (mqttClient && currentRoom) {
        mqttClient.publish(`yatzy_app_xyz/room/${currentRoom}`, JSON.stringify({ action: 'game_start', id: myId, turnOrder, colors: playerColors }));
    }
}
function broadcastGameStateSync() {
    if (mqttClient && currentRoom) {
        mqttClient.publish(`yatzy_app_xyz/room/${currentRoom}`, JSON.stringify({ action: 'game_state_sync', id: myId, turnOrder, colors: playerColors, currentTurnIndex }));
    }
}

function afterTurnBecameMine() {
    if (isMyTurn()) {
        myDice = [null, null, null, null, null];
        markedThisTurn = false;
        jokerModeActive = false;
        lastMarkedCatId = null;
        lastMarkedWasJoker = false;
    }
}
function endTurn() {
    if (!isMyTurn() || !markedThisTurn) return;
    logMove('end_turn', {});
    const nextIndex = (currentTurnIndex + 1) % turnOrder.length;
    broadcastTurnAdvance(nextIndex);
    applyTurnAdvance(nextIndex);
}

// ===== REINICIAR PARTIDA (SOLO ANFITRION) =====
function requestGameReset() {
    if (!isRoomCreator) return;
    document.getElementById('resetGameModal').style.display = 'flex';
}
function closeResetGameModal() { document.getElementById('resetGameModal').style.display = 'none'; }
function confirmGameReset() {
    closeResetGameModal();
    broadcastGameReset();
    applyGameReset();
}
function applyGameReset() {
    myScores = emptyScores();
    myExtraYatzys = 0;
    myBonusAnnounced = false;
    markedThisTurn = false;
    jokerModeActive = false;
    lastMarkedCatId = null;
    lastMarkedWasJoker = false;
    gameStarted = false;
    turnOrder = [];
    currentTurnIndex = 0;

    Object.keys(playersData).forEach(id => {
        playersData[id].scores = emptyScores();
        playersData[id].extraYatzys = 0;
        playersData[id].score = 0;
        playersData[id].color = null;
    });

    logMove('reset', {});
    renderPreGame(); renderTurnBanner(); renderDice(); renderScores(); renderLeaderboard();
    saveState();
}
function broadcastGameReset() {
    if (mqttClient && currentRoom) mqttClient.publish(`yatzy_app_xyz/room/${currentRoom}`, JSON.stringify({ action: 'game_reset', id: myId }));
}
function applyTurnAdvance(nextIndex) {
    currentTurnIndex = nextIndex;
    afterTurnBecameMine();
    renderTurnBanner(); renderDice(); renderScores(); renderLeaderboard();
}
function broadcastTurnAdvance(nextIndex) {
    if (mqttClient && currentRoom) {
        mqttClient.publish(`yatzy_app_xyz/room/${currentRoom}`, JSON.stringify({ action: 'turn_advance', id: myId, nextIndex }));
    }
}

// ===== LOBBY: NOMBRE / MODOS =====
function getPlayerName() {
    const name = document.getElementById('playerName').value.trim();
    return name || "Jugador " + Math.floor(Math.random() * 100);
}
function playSolo() {
    document.getElementById('lobbyModal').style.display = 'none';
    myName = getPlayerName();
    myId = Math.random().toString(36).substr(2, 9);
    turnOrder = [myId];
    playerColors = { [myId]: 'rojo' };
    currentTurnIndex = 0;
    gameStarted = true;
    myScores = emptyScores();
    myExtraYatzys = 0;
    playersData[myId] = { name: myName, color: 'rojo', scores: myScores, extraYatzys: 0, score: 0 };
    document.getElementById('preGamePanel').style.display = 'none';
    document.getElementById('gameArea').style.display = 'flex';
    document.getElementById('leaderboardPanel').style.display = 'none';
    afterTurnBecameMine();
    renderTurnBanner(); renderDice(); renderScores();
}
function showJoinModal() {
    document.getElementById('lobbyModal').style.display = 'none';
    document.getElementById('joinModal').style.display = 'flex';
}
function backToLobby() {
    document.getElementById('joinModal').style.display = 'none';
    document.getElementById('lobbyModal').style.display = 'flex';
}

// ===== CREAR / UNIRSE A SALA =====
function createRoom() {
    myName = getPlayerName();
    myId = Math.random().toString(36).substr(2, 9);
    myScores = emptyScores();
    myExtraYatzys = 0;
    isRoomCreator = true;
    pendingOrder = [];
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    connectToRoom(code);
}
function joinRoom() {
    myName = getPlayerName();
    const code = document.getElementById('roomCodeInput').value.trim().toUpperCase();
    if (code.length !== 4) { showNotice("El codigo debe tener 4 letras/numeros.", "Codigo invalido"); return; }
    isRoomCreator = false;

    const known = getRegistryEntry(code, myName);
    if (known) {
        myId = known.id;
        myScores = known.scores || emptyScores();
        myExtraYatzys = known.extraYatzys || 0;
        connectToRoom(code, true);
        return;
    }

    myId = Math.random().toString(36).substr(2, 9);
    myScores = emptyScores();
    myExtraYatzys = 0;
    connectToRoom(code);
}

function reconnectToSession() {
    const session = loadSession();
    if (!session) return;
    myId = session.myId;
    myName = session.myName;
    myScores = session.scores || emptyScores();
    myExtraYatzys = session.extraYatzys || 0;
    isRoomCreator = false;
    connectToRoom(session.roomCode, true);
}
function dismissSession() {
    clearSession();
    const banner = document.getElementById('sessionBanner');
    if (banner) banner.style.display = 'none';
}

// ===== CONEXION MQTT =====
function connectToRoom(code, isReconnect = false) {
    showLoading(isReconnect ? "Reconectando a la sala..." : "Conectando con la sala...");
    claimResolved = isReconnect;
    pendingClaim = null;
    gameLog = [];
    seenLogIds = new Set();

    mqttClient = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

    mqttClient.on('connect', () => {
        currentRoom = code;
        mqttClient.subscribe(`yatzy_app_xyz/room/${code}`);
        playersData[myId] = { name: myName, color: playerColors[myId] || null, scores: { ...myScores }, extraYatzys: myExtraYatzys, score: totalScore(myScores, myExtraYatzys) };
        joinSuccess(code);
        broadcastSync('join');
        persistSession();
    });

    mqttClient.on('message', (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            if (data.id === myId) return;

            if (data.action === 'remove') { delete playersData[data.id]; renderLeaderboard(); return; }

            if (data.action === 'claim_offer') {
                if (data.targetId === myId && !claimResolved && Object.values(myScores).every(v => v === null) && (data.scores)) {
                    claimResolved = true;
                    pendingClaim = { oldId: data.offeredId, name: data.name, score: data.score, scores: data.scores, extraYatzys: data.extraYatzys || 0 };
                    showClaimModal(pendingClaim);
                }
                return;
            }

            if (!claimResolved && data.name === myName && Object.values(myScores).every(v => v === null) && data.scores && Object.values(data.scores).some(v => v !== null)) {
                claimResolved = true;
                pendingClaim = { oldId: data.id, name: data.name, score: data.score, scores: data.scores, extraYatzys: data.extraYatzys || 0 };
                showClaimModal(pendingClaim);
                return;
            }

            if (data.action === 'game_start') {
                turnOrder = data.turnOrder;
                playerColors = data.colors;
                Object.keys(playerColors).forEach(id => { if (playersData[id]) playersData[id].color = playerColors[id]; });
                if (playersData[myId]) playersData[myId].color = playerColors[myId];
                currentTurnIndex = 0;
                gameStarted = true;
                afterTurnBecameMine();
                renderPreGame(); renderTurnBanner(); renderDice(); renderScores(); renderLeaderboard();
                saveState();
                return;
            }

            if (data.action === 'game_state_sync') {
                if (!gameStarted) {
                    turnOrder = data.turnOrder;
                    playerColors = data.colors;
                    currentTurnIndex = data.currentTurnIndex;
                    gameStarted = true;
                    Object.keys(playerColors).forEach(id => { if (playersData[id]) playersData[id].color = playerColors[id]; });
                    if (playersData[myId]) playersData[myId].color = playerColors[myId];
                    afterTurnBecameMine();
                    renderPreGame(); renderTurnBanner(); renderDice(); renderScores(); renderLeaderboard();
                }
                return;
            }

            if (data.action === 'turn_advance') { applyTurnAdvance(data.nextIndex); return; }
            if (data.action === 'game_reset') { applyGameReset(); return; }
            if (data.action === 'log_entry') { addLogEntry(data.entry, false); return; }
            if (data.action === 'event_toast') { showEventToast(data.text); return; }

            playersData[data.id] = { name: data.name, color: data.color, scores: data.scores, extraYatzys: data.extraYatzys || 0, score: data.score };
            renderLeaderboard();
            renderPreGame();

            if (data.action === 'join') {
                broadcastSync();
                if (gameStarted) broadcastGameStateSync();
                const cachedMatch = Object.keys(playersData).find(id =>
                    id !== data.id && playersData[id].name === data.name && playersData[id].scores && Object.values(playersData[id].scores).some(v => v !== null)
                );
                if (cachedMatch) broadcastClaimOffer(data.id, cachedMatch);
            }
        } catch (e) { console.error("Mensaje invalido", e); }
    });

    mqttClient.on('error', () => { hideLoading(); showNotice("Error de red. Revisa tu internet.", "Sin conexion"); });
}

// ===== RECLAMO DE NOMBRE =====
function showClaimModal(claim) {
    document.getElementById('claimText').textContent = `Ya hay un jugador "${claim.name}" en la sala con ${claim.score} pts. ¿Eres tu (te desconectaste antes)?`;
    document.getElementById('claimModal').style.display = 'flex';
}
function acceptClaim() {
    if (!pendingClaim) return;
    const staleTempId = myId;
    broadcastRemove(staleTempId);
    delete playersData[staleTempId];
    myId = pendingClaim.oldId;
    myScores = { ...pendingClaim.scores };
    myExtraYatzys = pendingClaim.extraYatzys || 0;
    myBonusAnnounced = upperBonus(myScores) === 35;
    saveState();
    renderScores();
    document.getElementById('claimModal').style.display = 'none';
    pendingClaim = null;
}
function declineClaim() { pendingClaim = null; document.getElementById('claimModal').style.display = 'none'; }

function broadcastRemove(idToRemove) {
    if (mqttClient && currentRoom) mqttClient.publish(`yatzy_app_xyz/room/${currentRoom}`, JSON.stringify({ action: 'remove', id: idToRemove }));
}
function broadcastClaimOffer(targetId, offeredId) {
    if (mqttClient && currentRoom) {
        const cached = playersData[offeredId];
        if (!cached) return;
        mqttClient.publish(`yatzy_app_xyz/room/${currentRoom}`, JSON.stringify({
            action: 'claim_offer', targetId, offeredId, name: cached.name, score: cached.score, scores: cached.scores, extraYatzys: cached.extraYatzys || 0
        }));
    }
}

// ===== EXITO AL UNIRSE =====
function joinSuccess(code) {
    hideLoading();
    document.getElementById('lobbyModal').style.display = 'none';
    document.getElementById('joinModal').style.display = 'none';
    const info = document.getElementById('roomInfoDisplay');
    info.style.display = 'inline-block';
    info.textContent = `SALA: ${code}`;
    document.getElementById('leaderboardPanel').style.display = 'flex';
    document.getElementById('gameLogPanel').style.display = 'flex';
    renderPreGame(); renderTurnBanner(); renderDice(); renderScores(); renderLeaderboard(); renderLog();
}

// ===== AVISO GENERAL (reemplaza alert() nativo) =====
function showNotice(text, title = 'Aviso') {
    document.getElementById('noticeTitle').textContent = title;
    document.getElementById('noticeText').textContent = text;
    document.getElementById('noticeModal').style.display = 'flex';
}
function closeNotice() { document.getElementById('noticeModal').style.display = 'none'; }

// ===== UTILIDADES =====
function showLoading(text) { document.getElementById('loadingText').textContent = text; document.getElementById('loadingModal').style.display = 'flex'; }
function hideLoading() { document.getElementById('loadingModal').style.display = 'none'; }

// ===== INICIALIZACION =====
document.addEventListener('DOMContentLoaded', function () {
    renderBoard();
    renderDice();
    renderScores();

    const session = loadSession();
    const banner = document.getElementById('sessionBanner');
    if (session && banner) {
        document.getElementById('sessionBannerText').textContent = `Tenias una partida abierta en la sala ${session.roomCode} como "${session.myName}".`;
        banner.style.display = 'block';
    }
});

// ===== EXPORTAR FUNCIONES GLOBALES =====
window.createRoom = createRoom;
window.joinRoom = joinRoom;
window.showJoinModal = showJoinModal;
window.backToLobby = backToLobby;
window.playSolo = playSolo;
window.reconnectToSession = reconnectToSession;
window.dismissSession = dismissSession;
window.acceptClaim = acceptClaim;
window.declineClaim = declineClaim;
window.closeTooltip = closeTooltip;
window.setDiceValue = setDiceValue;
window.closeDiceModal = closeDiceModal;
window.declineYatzyExtra = declineYatzyExtra;
window.acceptYatzyExtra = acceptYatzyExtra;
window.closeViewPlayer = closeViewPlayer;
window.startGame = startGame;
window.endTurn = endTurn;
window.requestGameReset = requestGameReset;
window.closeResetGameModal = closeResetGameModal;
window.confirmGameReset = confirmGameReset;
window.closeNotice = closeNotice;
