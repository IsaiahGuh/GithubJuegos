// ===== RENDERIZADO DEL TABLERO =====
function renderBoard() {
    var boardElement = document.getElementById('game-board');
    boardElement.innerHTML = '';
    
    for (var r = 0; r < rowsConfig.length; r++) {
        var rowConfig = rowsConfig[r];
        var rowDiv = document.createElement('div');
        rowDiv.className = 'row ' + rowConfig.id;
        
        for (var n = 0; n < rowConfig.numbers.length; n++) {
            var num = rowConfig.numbers[n];
            var box = document.createElement('div');
            box.className = 'box';
            box.id = rowConfig.id + '-' + n;
            box.textContent = num;
            (function(color, idx) {
                box.addEventListener('click', function() { handleBoxClick(color, idx); });
            })(rowConfig.id, n);
            rowDiv.appendChild(box);
        }
        
        var lockBox = document.createElement('div');
        lockBox.className = 'box lock';
        lockBox.id = rowConfig.id + '-11';
        lockBox.textContent = 'C';
        (function(color) {
            lockBox.addEventListener('click', function() { handleBoxClick(color, 11); });
        })(rowConfig.id);
        rowDiv.appendChild(lockBox);
        
        boardElement.appendChild(rowDiv);
    }
    updateVisuals();
}

// ===== ACTUALIZACION VISUAL =====
function updateVisuals() {
    var allBoxes = document.querySelectorAll('.box, .penalty-box');
    for (var i = 0; i < allBoxes.length; i++) {
        allBoxes[i].classList.remove('marked', 'disabled', 'last-marked');
    }
    
    var colors = ['red', 'yellow', 'green', 'blue'];
    for (var c = 0; c < colors.length; c++) {
        var color = colors[c];
        var highest = -1;
        for (var i = 0; i < moveHistory.length; i++) {
            var m = moveHistory[i];
            if (m.startsWith(color + '-')) {
                var val = parseInt(m.split('-')[1]);
                if (val > highest) highest = val;
            }
        }
        var rowDiv = document.querySelector('.row.' + color);
        if (!rowDiv) continue;
        var lockOwner = getGlobalLockOwner(color);
        var boxes = rowDiv.querySelectorAll('.box');
        for (var b = 0; b < boxes.length; b++) {
            var pos = moveHistory.indexOf(color + '-' + b);
            if (pos !== -1) {
                boxes[b].classList.add('marked');
                if (pos < moveHistory.length - 1) {
                    boxes[b].classList.add('disabled');
                } else {
                    boxes[b].classList.add('last-marked');
                }
            } else if (b <= highest) {
                boxes[b].classList.add('disabled');
            }
            // El candado bloqueado por otro jugador queda cerrado solo para esa casilla.
            if (b === 11 && pos === -1 && lockOwner && lockOwner.id !== myId) {
                boxes[b].classList.add('disabled');
            }
        }
    }
    
    for (var i = 0; i < 4; i++) {
        var pos = moveHistory.indexOf('penalty-' + i);
        if (pos !== -1) {
            var pbox = document.getElementById('penalty-' + i);
            pbox.classList.add('marked');
            if (pos < moveHistory.length - 1) {
                pbox.classList.add('disabled');
            } else {
                pbox.classList.add('last-marked');
            }
        }
    }

    if (gameEnded) {
        var endedBoxes = document.querySelectorAll('.box, .penalty-box');
        for (var e = 0; e < endedBoxes.length; e++) {
            endedBoxes[e].classList.add('disabled');
        }
    }
}

// ===== ACTUALIZACION DE UI DE TURNOS (igual que Yatzy) =====
function updateUI() {
    // Banner de turno
    var banner = document.getElementById('turnBanner');
    banner.classList.remove('my-turn', 'can-steal', 'already-stolen');
    if (!gameStarted) {
        banner.textContent = 'Esperando inicio...';
    } else if (turnOrder.length === 0) {
        banner.textContent = '';
    } else {
        var currentId = turnOrder[currentTurnIndex];
        var currentName = (playersData[currentId] && playersData[currentId].name) || (currentId === myId ? myName : '??');
        if (currentId === myId) {
            banner.textContent = turnLocked
                ? 'Ya marcaste — finaliza cuando quieras'
                : 'Tu turno — marca una casilla';
            banner.classList.add('my-turn');
        } else if (stealWindowOpen && !hasStolenThisTurn) {
            banner.textContent = 'Turno de: ' + currentName + ' — ¡Puedes robar!';
            banner.classList.add('can-steal');
        } else if (stealWindowOpen && hasStolenThisTurn) {
            banner.textContent = 'Ya robaste. Esperando a ' + currentName + '...';
            banner.classList.add('already-stolen');
        } else {
            banner.textContent = 'Turno de: ' + currentName;
        }
    }

    // Botón Iniciar: solo visible para anfitrion si partida no empezada y hay jugadores
    var startBtn = document.getElementById('startGameBtn');
    var showStart = isRoomCreator && !gameStarted && currentRoom;
    startBtn.style.display = showStart ? 'block' : 'none';
    startBtn.disabled = !showStart || (typeof pendingOrder !== 'undefined' && pendingOrder.length === 0);

    // Botón Finalizar turno: visible solo si es mi turno, ya marqué (turnLocked) y partida iniciada
    var endBtn = document.getElementById('endTurnBtn');
    var canEnd = isMyTurn() && turnLocked && gameStarted && !gameEnded;
    endBtn.disabled = !canEnd;

    // Botón Reiniciar: solo anfitrion, partida iniciada
    var resetBtn = document.getElementById('resetGameBtn');
    resetBtn.style.display = (isRoomCreator && gameStarted) ? 'block' : 'none';

    if (gameEnded) {
        startBtn.disabled = true;
        endBtn.disabled = true;
    }
}

// ===== ANIMACION CORTA DE "PULSO" AL CAMBIAR UN VALOR =====
function bumpElement(el) {
    if (!el) return;
    el.classList.remove('bump');
    void el.offsetWidth; // fuerza reflow para poder reiniciar la animacion
    el.classList.add('bump');
}

// ===== AVISO GENERAL (reemplaza alert() nativo) =====
function showNotice(text, title) {
    document.getElementById('noticeTitle').textContent = title || 'Aviso';
    document.getElementById('noticeText').textContent = text;
    document.getElementById('noticeModal').style.display = 'flex';
    sfxNotice();
}
function closeNotice() {
    document.getElementById('noticeModal').style.display = 'none';
}

// ===== TOAST DE EVENTOS =====
var toastQueue = [];
var toastShowing = false;

function showEventToast(text) {
    toastQueue.push(text);
    processToastQueue();
}
function processToastQueue() {
    if (toastShowing || toastQueue.length === 0) return;
    toastShowing = true;
    var el = document.getElementById('eventToast');
    if (!el) { toastShowing = false; return; }
    el.textContent = toastQueue.shift();
    el.classList.add('show');
    clearTimeout(showEventToast._t);
    showEventToast._t = setTimeout(function() {
        el.classList.remove('show');
        setTimeout(function() { toastShowing = false; processToastQueue(); }, 350);
    }, 3500);
}
function broadcastEvent(text) {
    publishRoom({ action: 'event_toast', id: myId, text: text });
}

// ===== EVENTOS DIFERIDOS (mismo patron que Yatzy con YATZY/bonos) =====
// Algunas jugadas (bloquear un candado, la falla automatica por 2 candados, robar la
// jugada del turno) se pueden deshacer mientras el turno sigue abierto. Para evitar
// anunciar algo que despues se deshace, encolamos el anuncio junto con el moveId que lo
// origino y solo lo mostramos/transmitimos cuando ese turno queda cerrado de verdad: al
// finalizar el turno (endTurn) o al recibir el avance de turno (turn_advance), lo que
// tambien cubre a quien robo, ya que la ventana de robo se cierra en ese mismo momento
// para todos — y es el jugador en turno el unico que puede finalizarlo.
var pendingEvents = []; // [{ moveId, text }]

function queueEvent(moveId, text) {
    pendingEvents.push({ moveId: moveId, text: text });
}

// Quita del pendiente cualquier evento asociado a un moveId que se acaba de deshacer.
function dequeueEventsForMove(moveId) {
    pendingEvents = pendingEvents.filter(function(e) { return e.moveId !== moveId; });
}

function flushPendingEvents() {
    if (pendingEvents.length === 0) return;
    var events = pendingEvents;
    pendingEvents = [];
    events.forEach(function(e) {
        showEventToast(e.text);
        broadcastEvent(e.text);
    });
}

function clearPendingEvents() {
    pendingEvents = [];
}