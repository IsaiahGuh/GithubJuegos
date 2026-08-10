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