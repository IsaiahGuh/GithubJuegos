// ============================================================
// ÁREA AMARILLA - CLEVERDADOS (CON DESHACER CORREGIDO)
// ============================================================

// Configuración del área amarilla
const AMARILLA_CONFIG = {
    filas: [
        { numeros: [3, 6, 5, 'X'], bonificacion: 'XAzul', color: '#1e88e5', simbolo: '✖', habilidadGris: 'x', indiceGris: 1 },
        { numeros: [2, 1, 'X', 5], bonificacion: '4Naranja', color: '#ff6f00', simbolo: '4', habilidadGris: 'seis', indiceGris: 1 },
        { numeros: [1, 'X', 2, 4], bonificacion: 'XVerde', color: '#43a047', simbolo: '✖', habilidadGris: 'x', indiceGris: 4 },
        { numeros: ['X', 3, 4, 6], bonificacion: 'Lobo', color: '#d32f2f', simbolo: '♦', habilidadGris: 'lobo', indiceGris: 0 }
    ],
    columnas: [10, 14, 16, 20],
    bonusTotal: '+1',
    indiceBonusTotal: 1
};

// Estado de bonificaciones desbloqueadas
let bonificacionesAmarilla = {
    fila0: false,
    fila1: false,
    fila2: false,
    fila3: false
};

let columnasCompletadas = [false, false, false, false];
let filasCompletadas = [false, false, false, false];
let todoCompletado = false;

let deshacerEnProgresoAmarilla = false;

// ============================================================
// INICIALIZACIÓN
// ============================================================

function inicializarAreaAmarilla() {
    const container = document.getElementById('area-amarilla-content');
    if (!container) return;
    
    // Asegurar que los estados estén sincronizados
    actualizarEstadosAmarilla();
    
    let html = `<div class="amarilla-grid">`;
    
    AMARILLA_CONFIG.filas.forEach((fila, filaIndex) => {
        html += `<div class="amarilla-fila" data-fila="${filaIndex}">`;
        
        fila.numeros.forEach((valor, colIndex) => {
            const esX = valor === 'X';
            const id = `amarilla-${filaIndex}-${colIndex}`;
            const estaMarcada = historialMovimientos.includes(id);
            const clasePreMarcada = esX ? 'pre-marcada' : '';
            const claseMarcada = estaMarcada ? 'marcada' : '';
            
            html += `
                <div class="cell ${clasePreMarcada} ${claseMarcada}" 
                     data-area="amarilla"
                     data-fila="${filaIndex}"
                     data-col="${colIndex}"
                     data-esx="${esX}"
                     data-id="${id}"
                     onclick="manejarClickAmarilla(${filaIndex}, ${colIndex})">
                    ${valor}
                </div>
            `;
        });
        
        const bonifDesbloqueada = bonificacionesAmarilla[`fila${filaIndex}`];
        const clase = bonifDesbloqueada ? 'puntaje-completado' : 'puntaje-pendiente';
        
        html += `
            <div class="amarilla-bonificacion-circulo puntaje-circulo ${clase}" 
                 data-amarilla-fila="${filaIndex}"
                 data-bonificacion="${fila.bonificacion}"
                 style="background-color: ${fila.color}; border-color: ${fila.color};">
                ${bonifDesbloqueada ? '✓' : fila.simbolo}
            </div>
        `;
        
        html += `</div>`;
    });
    
    html += `<div class="amarilla-puntajes">`;
    AMARILLA_CONFIG.columnas.forEach((puntaje, colIndex) => {
        const completada = columnasCompletadas[colIndex];
        const clase = completada ? 'puntaje-completado' : 'puntaje-pendiente';
        html += `
            <div class="puntaje-circulo ${clase}" data-columna="${colIndex}">
                ${completada ? '✓' : puntaje}
            </div>
        `;
    });
    
    const claseTotal = todoCompletado ? 'puntaje-completado' : 'puntaje-pendiente';
    html += `
        <div class="puntaje-circulo ${claseTotal}">${todoCompletado ? '✓' : '+1'}</div>
    `;
    
    html += `</div>`;
    html += `</div>`;
    
    container.innerHTML = html;
}

// ============================================================
// ACTUALIZAR ESTADOS DE AMARILLA - CORREGIDO CON LOBOS
// ============================================================

function actualizarEstadosAmarilla() {
    console.log('🔄 Actualizando estados de Amarilla...');
    
    // Recalcular filas completadas y bonificaciones
    AMARILLA_CONFIG.filas.forEach((config, filaIndex) => {
        let marcadas = 0;
        let totalNumeros = 0;
        
        config.numeros.forEach((valor, colIndex) => {
            if (valor !== 'X') {
                totalNumeros++;
                const id = `amarilla-${filaIndex}-${colIndex}`;
                if (historialMovimientos.includes(id)) {
                    marcadas++;
                }
            }
        });
        
        filasCompletadas[filaIndex] = (marcadas === totalNumeros && totalNumeros > 0);
        
        // ACTUALIZAR BONIFICACIÓN basado en filasCompletadas
        const bonifKey = `fila${filaIndex}`;
        bonificacionesAmarilla[bonifKey] = filasCompletadas[filaIndex];
        
        console.log(`  Fila ${filaIndex}: ${marcadas}/${totalNumeros} → ${filasCompletadas[filaIndex] ? 'COMPLETA ✅' : 'incompleta ❌'}, bonificación: ${bonificacionesAmarilla[bonifKey]}`);
        
        // Actualizar el círculo visual
        const circulo = document.querySelector(`.amarilla-bonificacion-circulo[data-amarilla-fila="${filaIndex}"]`);
        if (circulo) {
            if (filasCompletadas[filaIndex]) {
                circulo.classList.remove('puntaje-pendiente');
                circulo.classList.add('puntaje-completado');
                circulo.textContent = '✓';
            } else {
                circulo.classList.remove('puntaje-completado');
                circulo.classList.add('puntaje-pendiente');
                circulo.textContent = config.simbolo;
            }
        }
    });
    
    // Recalcular columnas completadas
    for (let colIndex = 0; colIndex < 4; colIndex++) {
        let todasMarcadas = true;
        for (let fila = 0; fila < 4; fila++) {
            const config = AMARILLA_CONFIG.filas[fila];
            const valor = config.numeros[colIndex];
            if (valor === 'X') continue;
            const id = `amarilla-${fila}-${colIndex}`;
            if (!historialMovimientos.includes(id)) {
                todasMarcadas = false;
                break;
            }
        }
        columnasCompletadas[colIndex] = todasMarcadas;
        
        console.log(`  Columna ${colIndex}: ${columnasCompletadas[colIndex] ? 'COMPLETA ✅' : 'incompleta ❌'}`);
        
        // Actualizar el círculo de columna
        const circulos = document.querySelectorAll('.amarilla-puntajes .puntaje-circulo');
        if (circulos[colIndex]) {
            if (columnasCompletadas[colIndex]) {
                circulos[colIndex].classList.remove('puntaje-pendiente');
                circulos[colIndex].classList.add('puntaje-completado');
                circulos[colIndex].textContent = '✓';
            } else {
                circulos[colIndex].classList.remove('puntaje-completado');
                circulos[colIndex].classList.add('puntaje-pendiente');
                circulos[colIndex].textContent = AMARILLA_CONFIG.columnas[colIndex];
            }
        }
    }
    
    // Recalcular todo completado
    todoCompletado = filasCompletadas.every(f => f === true) && columnasCompletadas.every(c => c === true);
    
    console.log(`  Todo completado: ${todoCompletado ? 'SÍ ✅' : 'NO ❌'}`);
    
    // Actualizar círculo +1
    const circulos = document.querySelectorAll('.amarilla-puntajes .puntaje-circulo');
    const ultimoCirculo = circulos[circulos.length - 1];
    if (ultimoCirculo) {
        if (todoCompletado) {
            ultimoCirculo.classList.remove('puntaje-pendiente');
            ultimoCirculo.classList.add('puntaje-completado');
            ultimoCirculo.textContent = '✓';
        } else {
            ultimoCirculo.classList.remove('puntaje-completado');
            ultimoCirculo.classList.add('puntaje-pendiente');
            ultimoCirculo.textContent = '+1';
        }
    }
    
    // ============================================================
    // RECALCULAR LOBOS DESDE BONIFICACIONES
    // ============================================================
    if (typeof window.recalcularLobosDesdeBonificaciones === 'function') {
        window.recalcularLobosDesdeBonificaciones();
    }
}

// ============================================================
// DESBLOQUEAR EN GRIS
// ============================================================

function desbloquearEnGris(habilidadId, indice) {
    console.log(`🔓 Desbloqueando en Gris: ${habilidadId}-${indice}`);
    
    // Intentar usar el sistema unificado
    if (typeof window.desbloquearHabilidadEnGris === 'function') {
        return window.desbloquearHabilidadEnGris(habilidadId, indice);
    }
    
    // Fallback: funciones específicas
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
    
    // Fallback final: DOM directo
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
// VERIFICAR FILAS COMPLETAS - CON SOPORTE PARA LOBOS CORREGIDO
// ============================================================

function verificarFilaCompleta(filaIndex) {
    const config = AMARILLA_CONFIG.filas[filaIndex];
    if (!config) return;
    
    let marcadas = 0;
    let totalNumeros = 0;
    
    config.numeros.forEach((valor, colIndex) => {
        if (valor !== 'X') {
            totalNumeros++;
            const id = `amarilla-${filaIndex}-${colIndex}`;
            if (historialMovimientos.includes(id)) {
                marcadas++;
            }
        }
    });
    
    if (marcadas === totalNumeros && !filasCompletadas[filaIndex] && totalNumeros > 0) {
        filasCompletadas[filaIndex] = true;
        bonificacionesAmarilla[`fila${filaIndex}`] = true;
        
        const circulo = document.querySelector(`.amarilla-bonificacion-circulo[data-amarilla-fila="${filaIndex}"]`);
        if (circulo) {
            circulo.classList.remove('puntaje-pendiente');
            circulo.classList.add('puntaje-completado');
            circulo.textContent = '✓';
        }
        
        console.log(`✅ Fila ${filaIndex} completada! Bonificación: ${config.bonificacion}`);
        
        if (config.bonificacion === 'Lobo') {
            // ============================================================
            // REGISTRAR LOBO CON GUARDADO DE ESTADO PARA DESHACER
            // ============================================================
            if (typeof registrarLobo === 'function') {
                // Guardar el estado ANTES del lobo
                const cantidadAntes = typeof lobos !== 'undefined' ? lobos.cantidad : 0;
                registrarLobo('amarilla');
                
                // Actualizar la última acción para incluir la info del lobo
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
            desbloquearEnGris(config.habilidadGris, config.indiceGris);
        }
    }
}

// ============================================================
// VERIFICAR COLUMNAS COMPLETAS
// ============================================================

function verificarColumnaCompleta(colIndex) {
    if (columnasCompletadas[colIndex]) return;
    
    let todasMarcadas = true;
    
    for (let fila = 0; fila < 4; fila++) {
        const config = AMARILLA_CONFIG.filas[fila];
        const valor = config.numeros[colIndex];
        if (valor === 'X') continue;
        const id = `amarilla-${fila}-${colIndex}`;
        if (!historialMovimientos.includes(id)) {
            todasMarcadas = false;
            break;
        }
    }
    
    if (todasMarcadas && !columnasCompletadas[colIndex]) {
        columnasCompletadas[colIndex] = true;
        
        const circulos = document.querySelectorAll('.amarilla-puntajes .puntaje-circulo');
        if (circulos[colIndex]) {
            circulos[colIndex].classList.remove('puntaje-pendiente');
            circulos[colIndex].classList.add('puntaje-completado');
            circulos[colIndex].textContent = '✓';
        }
        
        console.log(`✅ Columna ${colIndex} completada! +${AMARILLA_CONFIG.columnas[colIndex]} pts`);
        
        if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
            PUNTAJES.calcularTotal();
        }
    }
}

// ============================================================
// VERIFICAR TODO COMPLETO
// ============================================================

function verificarTodoCompleto() {
    if (todoCompletado) return;
    
    const todasFilas = filasCompletadas.every(f => f === true);
    const todasColumnas = columnasCompletadas.every(c => c === true);
    
    if (todasFilas && todasColumnas) {
        todoCompletado = true;
        
        const circulos = document.querySelectorAll('.amarilla-puntajes .puntaje-circulo');
        const ultimoCirculo = circulos[circulos.length - 1];
        if (ultimoCirculo) {
            ultimoCirculo.classList.remove('puntaje-pendiente');
            ultimoCirculo.classList.add('puntaje-completado');
            ultimoCirculo.textContent = '✓';
        }
        
        const indiceCorrecto = AMARILLA_CONFIG.indiceBonusTotal || 1;
        desbloquearEnGris('mas1', indiceCorrecto);
        
        console.log(`✅ Todo completado! +1 desbloqueado en Gris`);
    }
}

// ============================================================
// MANEJAR CLICK EN CELDA
// ============================================================

function manejarClickAmarilla(filaIndex, colIndex) {
    if (typeof enModoZoom === 'undefined' || !enModoZoom) {
        return;
    }
    
    if (deshacerEnProgresoAmarilla) {
        return;
    }
    
    const config = AMARILLA_CONFIG.filas[filaIndex];
    if (!config) return;
    
    const valor = config.numeros[colIndex];
    if (valor === 'X') return;
    
    const id = `amarilla-${filaIndex}-${colIndex}`;
    
    // SI ESTÁ MARCADA → DESHACER
    if (historialMovimientos.includes(id)) {
        deshacerEnProgresoAmarilla = true;
        
        if (typeof window.intentarDeshacer === 'function') {
            const resultado = window.intentarDeshacer(id);
            
            if (resultado && resultado.exito) {
                // ACTUALIZAR ESTADOS (esto recalcula bonificaciones)
                actualizarEstadosAmarilla();
                
                // RECONSTRUIR GRIS (esto quita los desbloqueos que ya no corresponden)
                if (typeof window.reconstruirGrisCompleto === 'function') {
                    window.reconstruirGrisCompleto();
                }
                
                if (typeof actualizarVisuales === 'function') {
                    actualizarVisuales();
                }
                if (typeof actualizarVisualesZoom === 'function') {
                    actualizarVisualesZoom();
                }
                
                if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
                    PUNTAJES.calcularTotal();
                }
                
                if (typeof renderizarLeaderboard === 'function') {
                    renderizarLeaderboard();
                }
                
                setTimeout(() => {
                    deshacerEnProgresoAmarilla = false;
                }, 200);
                
                return;
            }
        }
        
        deshacerEnProgresoAmarilla = false;
        return;
    }
    
    // SI NO ESTÁ MARCADA → MARCAR
    historialMovimientos.push(id);
    
    if (typeof window.guardarAccion === 'function') {
        window.guardarAccion('marcar', id, 'amarilla', {
            fila: filaIndex,
            col: colIndex,
            valor: valor
        });
    }
    
    if (typeof actualizarVisualesZoom === 'function') {
        actualizarVisualesZoom();
    }
    
    verificarFilaCompleta(filaIndex);
    verificarColumnaCompleta(colIndex);
    verificarTodoCompleto();
    
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    }
    
    actualizarVisuales();
    
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
}

// ============================================================
// RECALCULAR PUNTAJES (FALLBACK)
// ============================================================

function recalcularPuntajesAmarilla() {
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
        return;
    }
    
    let puntosColumnas = 0;
    columnasCompletadas.forEach((completada, index) => {
        if (completada) {
            puntosColumnas += AMARILLA_CONFIG.columnas[index];
        }
    });
    
    puntajesAreas.amarilla = puntosColumnas;
    document.getElementById('score-amarilla').textContent = puntosColumnas;
    
    let total = 0;
    const areas = ['gris', 'amarilla', 'azul', 'verde', 'naranja', 'morado'];
    areas.forEach(area => {
        total += puntajesAreas[area] || 0;
    });
    total += puntosBonificacion;
    
    puntajeTotal = total;
    document.getElementById('score-total').textContent = total;
    document.getElementById('bonus-display').textContent = puntosBonificacion;
}

// ============================================================
// RESET
// ============================================================

function resetAreaAmarilla() {
    bonificacionesAmarilla = {
        fila0: false,
        fila1: false,
        fila2: false,
        fila3: false
    };
    columnasCompletadas = [false, false, false, false];
    filasCompletadas = [false, false, false, false];
    todoCompletado = false;
    deshacerEnProgresoAmarilla = false;
    
    document.querySelectorAll('[data-area="amarilla"]').forEach(cell => {
        cell.classList.remove('marcada', 'desbloqueada', 'bloqueada', 'completada');
    });
    
    inicializarAreaAmarilla();
}

// ============================================================
// EXPORTAR
// ============================================================

window.inicializarAreaAmarilla = inicializarAreaAmarilla;
window.resetAreaAmarilla = resetAreaAmarilla;
window.recalcularPuntajesAmarilla = recalcularPuntajesAmarilla;
window.columnasCompletadas = columnasCompletadas;
window.manejarClickAmarilla = manejarClickAmarilla;
window.actualizarEstadosAmarilla = actualizarEstadosAmarilla;
window.bonificacionesAmarilla = bonificacionesAmarilla;
window.filasCompletadas = filasCompletadas;

console.log('🟨 Área Amarilla cargada correctamente');