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
            box.textContent = num;
            (function(color, idx) {
                box.addEventListener('click', function() { handleBoxClick(color, idx); });
            })(rowConfig.id, n);
            rowDiv.appendChild(box);
        }
        
        var lockBox = document.createElement('div');
        lockBox.className = 'box lock';
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
}

// ===== ACTUALIZACION DE UI DE TURNOS (igual que Yatzy) =====
function updateUI() {
    // Banner de turno
    var banner = document.getElementById('turnBanner');
    if (!gameStarted) {
        banner.textContent = 'Esperando inicio...';
        banner.classList.remove('my-turn');
    } else if (turnOrder.length === 0) {
        banner.textContent = '';
        banner.classList.remove('my-turn');
    } else {
        var currentId = turnOrder[currentTurnIndex];
        var currentName = (playersData[currentId] && playersData[currentId].name) || (currentId === myId ? myName : '??');
        if (currentId === myId) {
            banner.textContent = 'Tu turno — marca una casilla y finaliza';
            banner.classList.add('my-turn');
        } else {
            banner.textContent = 'Turno de: ' + currentName;
            banner.classList.remove('my-turn');
        }
    }

    // Botón Iniciar: solo visible para anfitrion si partida no empezada
    var startBtn = document.getElementById('startGameBtn');
    var showStart = isRoomCreator && !gameStarted && currentRoom;
    startBtn.style.display = showStart ? 'block' : 'none';
    startBtn.disabled = !showStart;

    // Botón Finalizar turno: visible solo si es mi turno, ya marqué (turnLocked) y partida iniciada
    var endBtn = document.getElementById('endTurnBtn');
    var canEnd = isMyTurn() && turnLocked && gameStarted;
    endBtn.disabled = !canEnd;

    // Botón Reiniciar: solo anfitrion, partida iniciada
    var resetBtn = document.getElementById('resetGameBtn');
    resetBtn.style.display = (isRoomCreator && gameStarted) ? 'block' : 'none';
}