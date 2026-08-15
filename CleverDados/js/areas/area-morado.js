// ============================================================
// AREA MORADO - CLEVERDADOS (CON DESHACER CORREGIDO Y TURNOS)
// ============================================================

// Configuracion del area morado
const MORADO_CONFIG = [
    { index: 0, valor: '', bonus: null, requiereNumero: true },
    { index: 1, valor: '', bonus: null, requiereNumero: true },
    { index: 2, valor: '', bonus: 'Espiral', color: '#78909c', simbolo: '♻', tipo: 'espiral', indiceGris: 5, requiereNumero: true },
    { index: 3, valor: '', bonus: 'XAzul', color: '#1e88e5', simbolo: '✖', tipo: 'x', indiceGris: 3, requiereNumero: true },
    { index: 4, valor: '', bonus: '+1', color: '#78909c', simbolo: '+1', tipo: 'mas1', indiceGris: 5, requiereNumero: true },
    { index: 5, valor: '', bonus: 'XAmarillo', color: '#fdd835', simbolo: '✖', tipo: 'x', indiceGris: 9, requiereNumero: true },
    { index: 6, valor: '', bonus: 'Lobo', color: '#d32f2f', simbolo: '♦', tipo: 'lobo', indiceGris: 0, requiereNumero: true },
    { index: 7, valor: '', bonus: 'Espiral', color: '#78909c', simbolo: '♻', tipo: 'espiral', indiceGris: 6, requiereNumero: true },
    { index: 8, valor: '', bonus: 'XVerde', color: '#43a047', simbolo: '✖', tipo: 'x', indiceGris: 6, requiereNumero: true },
    { index: 9, valor: '', bonus: '6Naranja', color: '#ff6f00', simbolo: '6', tipo: 'seis', indiceGris: 3, requiereNumero: true },
    { index: 10, valor: '', bonus: '+1', color: '#78909c', simbolo: '+1', tipo: 'mas1', indiceGris: 6, requiereNumero: true }
];

// Estado
let valoresMorado = new Array(11).fill(null);
let bonificacionesMorado = [
    false, // index 2: Espiral
    false, // index 3: XAzul
    false, // index 4: +1
    false, // index 5: XAmarillo
    false, // index 6: Lobo
    false, // index 7: Espiral
    false, // index 8: XVerde
    false, // index 9: 6Naranja
    false  // index 10: +1
];

const BONUS_INDICES_MORADO = [2, 3, 4, 5, 6, 7, 8, 9, 10];

let progresoMorado = 0;
let ultimoNumeroMorado = null;

let deshacerEnProgresoMorado = false;

// ============================================================
// INICIALIZACION
// ============================================================

function inicializarAreaMorado() {
    const container = document.getElementById('area-morado-content');
    if (!container) return;
    
    actualizarProgresoMorado();
    
    let html = `<div class="morado-grid">`;
    html += `<div class="morado-tabla-container">`;
    
    html += `<div class="morado-fila">`;
    MORADO_CONFIG.forEach((celda, index) => {
        const id = `morado-${index}`;
        const estaMarcada = historialMovimientos.includes(id);
        const valorGuardado = valoresMorado[index];
        const claseMarcada = estaMarcada ? 'marcada' : '';
        const tieneBonus = celda.bonus !== null;
        const claseBonus = tieneBonus ? 'bonus-cell' : '';
        
        let displayValor = celda.valor;
        if (estaMarcada && valorGuardado !== null) {
            displayValor = valorGuardado;
        }
        
        html += `
            <div class="morado-celda-wrapper">
                <div class="cell ${claseMarcada} ${claseBonus}" 
                     data-area="morado"
                     data-index="${index}"
                     data-id="${id}"
                     data-requiere-numero="${celda.requiereNumero}"
                     data-tiene-bonus="${tieneBonus}"
                     data-marcada="${estaMarcada}"
                     onclick="manejarClickMorado(${index})"
                     style="${estaMarcada ? 'border-color: #4caf50; color: #ffffff;' : ''}">
                    ${displayValor}
                </div>
            </div>
        `;
    });
    html += `</div>`;
    
    html += `<div class="morado-bonus-fila">`;
    MORADO_CONFIG.forEach((celda, index) => {
        const tieneBonus = celda.bonus !== null;
        if (tieneBonus) {
            html += `
                <div class="morado-bonus-item">
                    <div class="morado-bonificacion-circulo" 
                         data-morado-bonus="${index}"
                         style="background-color: ${celda.color}; border-color: ${celda.color}; opacity:0.5;">
                        ${celda.simbolo}
                    </div>
                </div>
            `;
        } else {
            html += `<div class="morado-bonus-item vacio"></div>`;
        }
    });
    html += `</div>`;
    
    html += `</div>`;
    html += `</div>`;
    container.innerHTML = html;
    
    actualizarVisualesMorado();
}

// ============================================================
// ACTUALIZAR PROGRESO
// ============================================================

function actualizarProgresoMorado() {
    let marcadasEnOrden = 0;
    
    if (typeof MORADO_CONFIG !== 'undefined' && MORADO_CONFIG && typeof historialMovimientos !== 'undefined') {
        for (let i = 0; i < MORADO_CONFIG.length; i++) {
            const id = `morado-${i}`;
            if (historialMovimientos.includes(id)) {
                marcadasEnOrden++;
            } else {
                break;
            }
        }
    }
    
    progresoMorado = marcadasEnOrden;
    
    if (progresoMorado > 0) {
        const ultimoIndex = progresoMorado - 1;
        ultimoNumeroMorado = valoresMorado[ultimoIndex];
    } else {
        ultimoNumeroMorado = null;
    }
    
    console.log('progresoMorado actualizado:', progresoMorado, 'ultimo numero:', ultimoNumeroMorado);
}

// ============================================================
// ACTUALIZAR VISUALES MORADO
// ============================================================

function actualizarVisualesMorado() {
    document.querySelectorAll('.cell[data-area="morado"]').forEach(cell => {
        const index = parseInt(cell.dataset.index);
        if (isNaN(index)) return;
        
        const id = `morado-${index}`;
        const estaMarcada = historialMovimientos.includes(id);
        const valorGuardado = valoresMorado[index];
        
        if (estaMarcada && valorGuardado !== null && valorGuardado !== undefined) {
            cell.classList.add('marcada');
            cell.textContent = valorGuardado;
            cell.style.borderColor = '#4caf50';
            cell.style.color = '#ffffff';
            cell.dataset.marcada = 'true';
        } else {
            cell.classList.remove('marcada');
            if (MORADO_CONFIG[index]) {
                cell.textContent = MORADO_CONFIG[index].valor || '';
            }
            cell.style.borderColor = '';
            cell.style.color = '';
            cell.dataset.marcada = 'false';
        }
    });
    
    if (typeof actualizarVisualesZoom === 'function') {
        actualizarVisualesZoom();
    }
}

// ============================================================
// ACTUALIZAR ESTADOS DE MORADO
// ============================================================

function actualizarEstadosMorado() {
    console.log('Actualizando estados de Morado...');
    
    BONUS_INDICES_MORADO.forEach((index, bonusIdx) => {
        const id = `morado-${index}`;
        bonificacionesMorado[bonusIdx] = historialMovimientos.includes(id);
        console.log('  Bonus ' + bonusIdx + ' (indice ' + index + '): ' + (bonificacionesMorado[bonusIdx] ? 'ACTIVO' : 'inactivo'));
    });
    
    if (typeof window.recalcularLobosDesdeBonificaciones === 'function') {
        window.recalcularLobosDesdeBonificaciones();
    }
}

// ============================================================
// DESBLOQUEAR EN GRIS
// ============================================================

function desbloquearEnGrisMorado(habilidadId, indice) {
    console.log('Desbloqueando en Gris (Morado):', habilidadId + '-' + indice);
    
    if (typeof window.desbloquearHabilidadEnGris === 'function') {
        return window.desbloquearHabilidadEnGris(habilidadId, indice);
    }
    
    if (habilidadId === 'x' && typeof window.desbloquearXExterno === 'function') {
        return window.desbloquearXExterno(indice);
    }
    if (habilidadId === 'seis' && typeof window.desbloquearSeisExterno === 'function') {
        return window.desbloquearSeisExterno(indice);
    }
    if (habilidadId === 'espiral' && typeof window.desbloquearEspiralExterno === 'function') {
        return window.desbloquearEspiralExterno(indice);
    }
    if (habilidadId === 'mas1' && typeof window.desbloquearMas1Externo === 'function') {
        return window.desbloquearMas1Externo(indice);
    }
    
    const selector = `.celda-habilidad[data-habilidad="${habilidadId}"][data-col="${indice}"]`;
    const cell = document.querySelector(selector);
    
    if (cell && cell.classList.contains('bloqueada')) {
        cell.classList.remove('bloqueada');
        cell.classList.add('desbloqueada');
        if (cell.dataset.color) {
            cell.style.opacity = '1';
            cell.style.filter = 'none';
        }
        return true;
    }
    return false;
}

// ============================================================
// VERIFICAR BONIFICACION
// ============================================================

function verificarBonificacionMorado(index) {
    const bonusIdx = BONUS_INDICES_MORADO.indexOf(index);
    if (bonusIdx === -1) return;
    if (bonificacionesMorado[bonusIdx]) return;
    
    const celda = MORADO_CONFIG[index];
    if (!celda.bonus) return;
    
    bonificacionesMorado[bonusIdx] = true;
    
    console.log('Bonificacion en Morado indice ' + index + ': ' + celda.bonus);
    
    if (celda.bonus === 'Lobo') {
        if (typeof registrarLobo === 'function') {
            const cantidadAntes = typeof lobos !== 'undefined' ? lobos.cantidad : 0;
            registrarLobo('morado');
            
            if (typeof window.actualizarUltimaAccion === 'function') {
                window.actualizarUltimaAccion({
                    tipo: 'marcar_con_lobo',
                    cantidadAntes: cantidadAntes,
                    cantidadDespues: cantidadAntes + 1,
                    otorgoLobo: true,
                    lobosAntes: cantidadAntes
                });
            }
        }
    } else {
        aplicarBonificacionMorado(celda);
    }
}

// ============================================================
// APLICAR BONIFICACION
// ============================================================

function aplicarBonificacionMorado(celda) {
    if (!celda.bonus) return;
    
    switch(celda.tipo) {
        case 'espiral':
            desbloquearEnGrisMorado('espiral', celda.indiceGris);
            break;
        case 'mas1':
            desbloquearEnGrisMorado('mas1', celda.indiceGris);
            break;
        case 'x':
            desbloquearEnGrisMorado('x', celda.indiceGris);
            break;
        case 'seis':
            desbloquearEnGrisMorado('seis', celda.indiceGris);
            break;
        case 'lobo':
            break;
    }
    
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    } else {
        recalcularPuntajesMorado();
    }
}

// ============================================================
// MANEJAR CLICK EN CELDA - CON TURNOS
// ============================================================

function manejarClickMorado(index) {
    // Verificar si se puede marcar (sistema de turnos)
    if (typeof window.puedeMarcar === 'function' && !window.puedeMarcar()) {
        return;
    }
    
    if (typeof enModoZoom === 'undefined' || !enModoZoom) {
        return;
    }
    
    if (deshacerEnProgresoMorado) {
        console.log('Deshacer en progreso, ignorando click');
        return;
    }
    
    const celda = MORADO_CONFIG[index];
    const id = `morado-${index}`;
    
    console.log('Click en morado[' + index + '], id: ' + id);
    
    if (historialMovimientos.includes(id)) {
        console.log('Intento deshacer ' + id);
        
        deshacerEnProgresoMorado = true;
        
        if (typeof window.intentarDeshacer === 'function') {
            const resultado = window.intentarDeshacer(id);
            
            if (resultado && resultado.exito) {
                console.log('Deshacer exitoso para ' + id);
                actualizarEstadosMorado();
                actualizarProgresoMorado();
                actualizarVisualesMorado();
                
                if (typeof window.reconstruirGrisCompleto === 'function') {
                    window.reconstruirGrisCompleto();
                }
                
                if (typeof actualizarVisuales === 'function') {
                    actualizarVisuales();
                }
                
                if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
                    PUNTAJES.calcularTotal();
                } else {
                    recalcularPuntajesMorado();
                }
                
                if (typeof renderizarLeaderboard === 'function') {
                    renderizarLeaderboard();
                }
                
                setTimeout(() => {
                    deshacerEnProgresoMorado = false;
                }, 200);
                
                return;
            } else {
                console.log('No se pudo deshacer ' + id);
                const cell = document.querySelector(`[data-area="morado"][data-index="${index}"]`);
                if (typeof window.mostrarFeedbackError === 'function') {
                    window.mostrarFeedbackError(cell);
                }
                deshacerEnProgresoMorado = false;
                return;
            }
        }
        
        deshacerEnProgresoMorado = false;
        return;
    }
    
    console.log('progresoMorado: ' + progresoMorado + ', index: ' + index);
    
    if (index !== progresoMorado) {
        console.log('Fuera de orden: esperaba ' + progresoMorado + ', recibio ' + index);
        const cell = document.querySelector(`[data-area="morado"][data-index="${index}"]`);
        if (cell) {
            cell.style.borderColor = '#ff4444';
            setTimeout(() => {
                cell.style.borderColor = '';
            }, 500);
        }
        return;
    }
    
    if (celda.requiereNumero) {
        console.log('Mostrando modal numerico para ' + id);
        const titulo = celda.bonus ? 'Marcar ' + celda.bonus : 'Ingresa el dado';
        const subtitulo = celda.bonus ? 'Selecciona el numero para obtener ' + celda.bonus : 'Que numero obtuviste?';
        
        if (typeof mostrarModalNumerico === 'function') {
            mostrarModalNumerico(function(numero) {
                console.log('Numero seleccionado: ' + numero);
                if (ultimoNumeroMorado !== null && ultimoNumeroMorado !== 6) {
                    if (numero <= ultimoNumeroMorado) {
                        const cell = document.querySelector(`[data-area="morado"][data-index="${index}"]`);
                        if (cell) {
                            cell.style.borderColor = '#ff4444';
                            setTimeout(() => {
                                cell.style.borderColor = '';
                            }, 1000);
                        }
                        alert('El numero debe ser mayor que ' + ultimoNumeroMorado + '. Si pones 6, se reinicia.');
                        return;
                    }
                }
                
                const valorAnterior = valoresMorado[index];
                valoresMorado[index] = numero;
                marcarMorado(index, numero, valorAnterior);
            }, titulo, subtitulo);
        } else {
            const numero = prompt('Ingresa un numero del 1 al 6:');
            if (numero !== null) {
                const num = parseInt(numero);
                if (num >= 1 && num <= 6) {
                    if (ultimoNumeroMorado !== null && ultimoNumeroMorado !== 6) {
                        if (num <= ultimoNumeroMorado) {
                            alert('El numero debe ser mayor que ' + ultimoNumeroMorado + '. Si pones 6, se reinicia.');
                            return;
                        }
                    }
                    const valorAnterior = valoresMorado[index];
                    valoresMorado[index] = num;
                    marcarMorado(index, num, valorAnterior);
                }
            }
        }
        return;
    }
}

// ============================================================
// MARCAR CASILLA - CON TURNOS
// ============================================================

function marcarMorado(index, numero, valorAnterior) {
    const celda = MORADO_CONFIG[index];
    const id = `morado-${index}`;
    
    if (historialMovimientos.includes(id)) return;
    
    historialMovimientos.push(id);
    valoresMorado[index] = numero;
    
    if (typeof window.guardarAccion === 'function') {
        window.guardarAccion('numero', id, 'morado', {
            index: index,
            valor: numero,
            valorAnterior: valorAnterior !== undefined ? valorAnterior : null
        });
    }
    
    // Registrar marca en el sistema de turnos
    if (typeof window.registrarMarca === 'function') {
        window.registrarMarca(id);
    }
    
    actualizarVisualesMorado();
    actualizarProgresoMorado();
    verificarBonificacionMorado(index);
    
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    } else {
        recalcularPuntajesMorado();
    }
    
    actualizarVisuales();
    
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
}

// ============================================================
// RECALCULAR PUNTAJES (FALLBACK)
// ============================================================

function recalcularPuntajesMorado() {
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
        return;
    }
    
    const marcasMorado = historialMovimientos ? historialMovimientos.filter(m => m.startsWith('morado-')).length : 0;
    
    let puntos = 0;
    if (marcasMorado > 0) {
        puntos = marcasMorado * (marcasMorado + 1) / 2;
    }
    
    puntajesAreas.morado = puntos;
    const element = document.getElementById('score-morado');
    if (element) element.textContent = puntos;
    
    let total = 0;
    const areas = ['gris', 'amarilla', 'azul', 'verde', 'naranja', 'morado'];
    areas.forEach(area => {
        total += puntajesAreas[area] || 0;
    });
    total += puntosBonificacion;
    
    puntajeTotal = total;
    const totalElement = document.getElementById('score-total');
    const bonusElement = document.getElementById('bonus-display');
    if (totalElement) totalElement.textContent = total;
    if (bonusElement) bonusElement.textContent = puntosBonificacion;
}

// ============================================================
// RESET
// ============================================================

function resetAreaMorado() {
    valoresMorado = new Array(11).fill(null);
    bonificacionesMorado = [false, false, false, false, false, false, false, false, false];
    progresoMorado = 0;
    ultimoNumeroMorado = null;
    deshacerEnProgresoMorado = false;
    
    document.querySelectorAll('.cell[data-area="morado"]').forEach(cell => {
        const index = parseInt(cell.dataset.index);
        cell.classList.remove('marcada');
        cell.style.borderColor = '';
        cell.style.color = '';
        if (MORADO_CONFIG[index]) {
            cell.textContent = MORADO_CONFIG[index].valor || '';
        }
    });
    
    inicializarAreaMorado();
}

// ============================================================
// EXPORTAR
// ============================================================

window.inicializarAreaMorado = inicializarAreaMorado;
window.resetAreaMorado = resetAreaMorado;
window.recalcularPuntajesMorado = recalcularPuntajesMorado;
window.valoresMorado = valoresMorado;
window.actualizarVisualesMorado = actualizarVisualesMorado;
window.manejarClickMorado = manejarClickMorado;
window.marcarMorado = marcarMorado;
window.actualizarEstadosMorado = actualizarEstadosMorado;
window.progresoMorado = progresoMorado;
window.ultimoNumeroMorado = ultimoNumeroMorado;
window.bonificacionesMorado = bonificacionesMorado;

console.log('Area Morado cargada correctamente');