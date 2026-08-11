// ===== UI.JS =====
// Control de interfaz de usuario y renderizado

// ============================================================
// MENSAJES TEMPORALES
// ============================================================

function showTemporaryMessage(message, duration = 1500) {
    let toast = document.getElementById('toastMessage');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastMessage';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 0.9rem;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            border: 1px solid var(--border-color);
            max-width: 90%;
            text-align: center;
        `;
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.style.opacity = '1';
    
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.style.opacity = '0';
    }, duration);
}

// ============================================================
// SHOW CARD SELECTOR
// ============================================================

function showCardSelector() {
    if (window.gameState && window.gameState.isFinished) {
        showTemporaryMessage('La partida ya finalizo');
        return;
    }
    
    if (window.gameState && window.gameState.gameStarted && window.cartillasState && window.cartillasState.initialCardSelectionDone) {
        showTemporaryMessage('La partida ya esta en curso');
        return;
    }
    
    if (window.cartillasState && window.cartillasState.cardsDealt && window.cartillasState.availableCards.length > 0) {
        if (typeof showInitialCardSelector === 'function') {
            showInitialCardSelector(window.cartillasState.availableCards);
        }
        return;
    }
    
    if (typeof repartirCartillasUnicas === 'function') {
        repartirCartillasUnicas();
    }
}

// ============================================================
// RENDER BOARD
// ============================================================

function renderBoard() {
    const boardElement = document.getElementById('game-board');
    boardElement.innerHTML = '';
    
    if (!window.gameState.gameStarted || !window.cartillasState || !window.cartillasState.initialCardSelectionDone) {
        boardElement.innerHTML = `
            <div class="empty-board-message">
                <div class="icon">🎲</div>
                <div class="title">Esperando para comenzar</div>
                <div class="subtitle">Presiona "Vitrinas" para seleccionar tu cartilla</div>
            </div>
        `;
        boardElement.style.display = 'flex';
        boardElement.style.alignItems = 'center';
        boardElement.style.justifyContent = 'center';
        boardElement.style.minHeight = '200px';
        return;
    }
    
    boardElement.style.display = 'flex';
    boardElement.style.flexDirection = 'column';
    boardElement.style.gap = '4px';
    boardElement.style.minHeight = 'auto';
    
    const card = getCurrentCard();
    if (!card) {
        boardElement.innerHTML = `<div class="empty-board-message"><div class="title">Error: Cartilla no encontrada</div></div>`;
        return;
    }

    let privatePattern = null;
    let miColorHex = null;
    let mostrarBordes = false;
    
    if (window.gameState.privateObjectiveId) {
        const privObj = getObjetivoPrivadoById(window.gameState.privateObjectiveId);
        if (privObj) {
            privatePattern = privObj.patron;
        }
    }
    
    if (typeof getMiColor === 'function') {
        const miColorId = getMiColor();
        if (miColorId && typeof getHexColor === 'function') {
            miColorHex = getHexColor(miColorId);
        }
    }
    
    if (typeof getMostrarBordesObjetivo === 'function') {
        mostrarBordes = getMostrarBordesObjetivo();
    }
    
    card.rows.forEach((row, rowIndex) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        
        row.forEach((cell, colIndex) => {
            const box = document.createElement('div');
            box.className = 'box';
            box.dataset.row = rowIndex;
            box.dataset.col = colIndex;
            
            const moveId = `${rowIndex}-${colIndex}`;
            const isMarked = window.gameState.moveHistory.includes(moveId);
            
            const colorClass = getCellColorClass(cell);
            const hasColor = colorClass !== null;
            const hasValue = cell.value !== null && cell.value !== undefined;
            
            if (hasColor) {
                box.classList.add(colorClass);
            }
            
            if (hasValue && !hasColor) {
                box.classList.add('has-number-only');
            }
            
            if (hasValue && typeof cell.value === 'number') {
                box.innerHTML = renderizarDado(cell.value, null, '#ffffff');
            } else {
                box.textContent = '';
                if (!hasColor && !hasValue) {
                    box.style.backgroundColor = 'var(--bg-cell)';
                }
            }
            
            if (isMarked) {
                box.classList.add('marked');
            }

            if (privatePattern && miColorHex && mostrarBordes) {
                if (privatePattern[rowIndex] && privatePattern[rowIndex][colIndex] === 1) {
                    box.style.setProperty('outline', `4px solid ${miColorHex}`, 'important');
                    box.style.setProperty('outline-offset', '-2px', 'important');
                    box.style.setProperty('box-shadow', `0 0 16px ${miColorHex}60, inset 0 0 10px ${miColorHex}30`, 'important');
                    box.style.setProperty('border', '', 'important');
                } else {
                    if (!hasColor) {
                        box.style.setProperty('outline', '', 'important');
                        box.style.setProperty('outline-offset', '', 'important');
                        box.style.setProperty('border', '');
                        box.style.setProperty('box-shadow', '');
                    }
                }
            } else if (!mostrarBordes) {
                if (!hasColor) {
                    box.style.setProperty('outline', '', 'important');
                    box.style.setProperty('outline-offset', '', 'important');
                    box.style.setProperty('border', '');
                    box.style.setProperty('box-shadow', '');
                }
            }

            if (window.gameState.isFinished) {
                box.style.cursor = 'default';
                box.style.opacity = '0.85';
            }

            box.addEventListener('click', () => handleBoxClick(rowIndex, colIndex));
            rowDiv.appendChild(box);
        });
        
        boardElement.appendChild(rowDiv);
    });
    
    if (typeof renderFavoresConColor === 'function') {
        renderFavoresConColor();
    } else if (typeof renderFavoresDisplay === 'function') {
        renderFavoresDisplay();
    }
    
    calculateScores();
}

// ============================================================
// RENDER FAVORES DISPLAY
// ============================================================

function renderFavoresDisplay() {
    const oldFavores = document.getElementById('favoresDisplay');
    if (oldFavores) oldFavores.remove();
    
    const boardContainer = document.querySelector('.board-container');
    if (!boardContainer) return;
    
    const favoresDiv = document.createElement('div');
    favoresDiv.id = 'favoresDisplay';
    
    const total = herramientasState.favores.total;
    const disponibles = herramientasState.favores.disponibles;
    const gastados = herramientasState.favores.gastados;
    
    if (total === 0) {
        favoresDiv.style.display = 'none';
        boardContainer.appendChild(favoresDiv);
        return;
    }
    
    favoresDiv.style.cssText = `
        margin-top: 12px;
        padding: 10px 14px;
        background: var(--bg-box);
        border-radius: 10px;
        border: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        flex-wrap: wrap;
        transition: all 0.3s ease;
    `;
    
    const puntosContainer = document.createElement('div');
    puntosContainer.className = 'favores-puntos';
    puntosContainer.style.cssText = 'display: flex; gap: 6px; align-items: center;';
    
    for (let i = 0; i < total; i++) {
        const punto = document.createElement('span');
        const esGastado = i < gastados;
        punto.textContent = '●';
        punto.className = `favores-punto ${esGastado ? 'gastado' : 'activo'}`;
        punto.style.cssText = `
            font-size: 1.6rem;
            line-height: 1;
            transition: all 0.3s ease;
            display: inline-block;
            color: ${esGastado ? 'var(--text-muted)' : 'var(--color-yellow)'};
            opacity: ${esGastado ? '0.2' : '1'};
            transform: ${esGastado ? 'scale(0.85)' : 'scale(1)'};
            text-shadow: ${esGastado ? 'none' : '0 0 10px rgba(253,216,53,0.3)'};
        `;
        if (!esGastado) {
            punto.style.animation = 'favor-pulse 2s ease-in-out infinite';
        }
        puntosContainer.appendChild(punto);
    }
    favoresDiv.appendChild(puntosContainer);
    
    boardContainer.appendChild(favoresDiv);
}

// ============================================================
// RENDER GAME INFO
// ============================================================

function renderGameInfo() {
    if (!window.gameState.publicObjectives || window.gameState.publicObjectives.length === 0) {
        const container = document.getElementById('publicObjectives');
        if (container) {
            container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8rem; text-align: center; padding: 8px;">Esperando objetivos del creador...</div>';
        }
        const toolsContainer = document.getElementById('toolsDisplay');
        if (toolsContainer) {
            toolsContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8rem; text-align: center; padding: 8px;">Esperando herramientas...</div>';
        }
        return;
    }
    
    const container = document.getElementById('publicObjectives');
    if (container) {
        container.innerHTML = '';
        window.gameState.publicObjectives.forEach(objId => {
            const obj = getObjetivoPublicoById(objId);
            if (obj) {
                const el = document.createElement('div');
                el.className = 'objective-badge public';
                el.innerHTML = `
                    <div class="objective-name">${obj.nombre}</div>
                    <div class="objective-desc">${obj.descripcion}</div>
                    <div class="objective-points">${obj.puntos_base || '?'} pts</div>
                `;
                container.appendChild(el);
            }
        });
    }
    
    const toolsContainer = document.getElementById('toolsDisplay');
    if (toolsContainer) {
        toolsContainer.innerHTML = '';
        if (window.gameState.tools && window.gameState.tools.length > 0) {
            window.gameState.tools.forEach(toolId => {
                const tool = getHerramientaById(toolId);
                const info = getHerramientaInfo(toolId);
                if (tool && info) {
                    const el = document.createElement('div');
                    const yaUsadaPorMi = info.yaUsadaPorMi;
                    const costo = info.costo;
                    const disponible = info.disponible && !yaUsadaPorMi;
                    
                    let estadoClass = '';
                    if (yaUsadaPorMi) {
                        estadoClass = 'used';
                    } else if (disponible) {
                        estadoClass = 'available';
                    } else {
                        estadoClass = 'unavailable';
                    }
                    
                    let dotsHtml = '';
                    for (let i = 0; i < costo; i++) {
                        dotsHtml += `<span class="cost-dot">●</span>`;
                    }
                    
                    let usuariosHtml = '';
                    if (info.usuarios.length > 0) {
                        const nombres = info.usuarios.map(id => {
                            const p = window.playersData ? window.playersData[id] : null;
                            return p ? p.name : id.substring(0, 4);
                        });
                        usuariosHtml = `<div style="font-size: 0.5rem; color: var(--text-muted);">Usada por: ${nombres.join(', ')}</div>`;
                    }
                    
                    el.className = `tool-badge ${estadoClass}`;
                    el.style.cssText = `
                        ${yaUsadaPorMi ? 'opacity: 0.5; border-color: var(--text-muted);' : ''}
                        ${disponible && !yaUsadaPorMi ? 'cursor: pointer; border-color: var(--color-green);' : ''}
                        ${!disponible && !yaUsadaPorMi ? 'opacity: 0.5; border-color: var(--color-red);' : ''}
                        transition: all 0.2s ease;
                    `;
                    
                    el.innerHTML = `
                        <div class="tool-name">${tool.nombre}</div>
                        <div class="tool-desc">${tool.descripcion_corta}</div>
                        <div class="tool-cost">${dotsHtml}</div>
                        ${usuariosHtml}
                    `;
                    
                    if (window.gameState.isFinished) {
                        el.style.cursor = 'default';
                        el.style.opacity = '0.4';
                    } else if (disponible && !yaUsadaPorMi) {
                        el.addEventListener('click', () => usarHerramientaUI(toolId));
                        el.title = `Usar ${tool.nombre} (costo: ${costo} favor${costo > 1 ? 'es' : ''})`;
                    } else if (yaUsadaPorMi) {
                        el.title = 'Ya usaste esta herramienta';
                    } else {
                        el.title = `Necesitas ${costo} favor(es), tienes ${herramientasState.favores.disponibles}`;
                    }
                    
                    toolsContainer.appendChild(el);
                }
            });
        } else {
            toolsContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 0.7rem; text-align: center; padding: 4px;">No hay herramientas disponibles</div>';
        }
    }
}

// ============================================================
// RESTAURAR MODAL DE CONFIRMACION
// ============================================================

function restaurarModalConfirmacion() {
    const modal = document.getElementById('confirmModal');
    if (!modal) return;
    
    const title = modal.querySelector('h3');
    const desc = modal.querySelector('p');
    const confirmBtn = document.getElementById('confirmResetBtn');
    const cancelBtn = document.getElementById('cancelResetBtn');
    
    if (title) title.textContent = 'Reiniciar Todo';
    if (desc) desc.textContent = '';
    if (confirmBtn) {
        confirmBtn.style.display = '';
        confirmBtn.textContent = 'Reiniciar Todo';
    }
    if (cancelBtn) cancelBtn.style.display = 'none';
}

// ============================================================
// CONFIGURAR EVENTOS UI
// ============================================================

function setupUIEvents() {
    const startGameBtn = document.getElementById('startGameBtn');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', function() {
            if (window.gameState && window.gameState.isFinished) {
                showTemporaryMessage('La partida ya finalizo');
                return;
            }
            if (window.gameState && window.gameState.gameStarted && window.cartillasState && window.cartillasState.initialCardSelectionDone) {
                showTemporaryMessage('La partida ya esta en curso');
                return;
            }
            showCardSelector();
        });
    }
    
    const finishGameBtn = document.getElementById('finishGameBtn');
    if (finishGameBtn) {
        finishGameBtn.addEventListener('click', function() {
            if (typeof finalizarPartida === 'function') {
                finalizarPartida();
            }
        });
    }
    
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            const modal = document.getElementById('confirmModal');
            if (modal) {
                const title = modal.querySelector('h3');
                const desc = modal.querySelector('p');
                const confirmBtn = document.getElementById('confirmResetBtn');
                const cancelBtn = document.getElementById('cancelResetBtn');
                
                if (title) title.textContent = 'Reiniciar Todo';
                if (desc) desc.textContent = '';
                
                if (cancelBtn) {
                    cancelBtn.style.display = 'none';
                }
                
                if (confirmBtn) {
                    confirmBtn.textContent = 'Reiniciar Todo';
                    confirmBtn.style.display = '';
                    confirmBtn.style.backgroundColor = 'var(--color-red)';
                    confirmBtn.onclick = function() {
                        if (typeof resetFullGame === 'function') {
                            resetFullGame();
                        }
                        closeModalById('confirmModal');
                        restaurarModalConfirmacion();
                    };
                }
                
                openModalById('confirmModal');
            }
        });
    }
    
    const cancelResetBtn = document.getElementById('cancelResetBtn');
    if (cancelResetBtn) {
        cancelResetBtn.addEventListener('click', function() {
            closeModalById('confirmModal');
            restaurarModalConfirmacion();
        });
    }
}

// ============================================================
// INICIALIZACION
// ============================================================

function initUI() {
    setupUIEvents();
    renderBoard();
    calculateScores();
}

// ============================================================
// EXPORTAR
// ============================================================

window.showCardSelector = showCardSelector;
window.renderBoard = renderBoard;
window.renderFavoresDisplay = renderFavoresDisplay;
window.renderGameInfo = renderGameInfo;
window.showTemporaryMessage = showTemporaryMessage;
window.initUI = initUI;
window.restaurarModalConfirmacion = restaurarModalConfirmacion;

console.log('ui.js cargado - Con boton Terminar');