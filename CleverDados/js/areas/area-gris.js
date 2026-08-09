// ============================================================
// ÁREA GRIS - CLEVERDADOS (CON DESHACER CORREGIDO)
// ============================================================

// Configuración de turnos y sus bonificaciones
const TURNOS_CONFIG = [
    { numero: 1, bonificacion: '♻', efecto: 'Espiral', habilidad: 'espiral' },
    { numero: 2, bonificacion: '+1', efecto: '+1 punto', habilidad: 'mas1' },
    { numero: 3, bonificacion: '♻', efecto: 'Espiral', habilidad: 'espiral' },
    { numero: 4, bonificacion: '✖', efecto: 'X', habilidad: 'x' },
    { numero: 5, bonificacion: '•••', efecto: '1 dado adicional', habilidad: 'dados1' },
    { numero: 6, bonificacion: '•|••', efecto: '2 dados adicionales', habilidad: 'dados2' }
];

// Configuración de habilidades (todas las celdas) - SIN LOBO
const HABILIDADES_CONFIG = {
    espiral: {
        id: 'espiral',
        simbolo: '♻',
        celdas: 7,
        turnosDesbloqueo: [1, 3],
        columna: 1,
        fila: 0
    },
    mas1: {
        id: 'mas1',
        simbolo: '+1',
        celdas: 7,
        turnosDesbloqueo: [2],
        columna: 1,
        fila: 1
    },
    dados1: {
        id: 'dados1',
        simbolo: '•••',
        celdas: 1,
        turnosDesbloqueo: [5],
        columna: 1,
        fila: 2
    },
    dados2: {
        id: 'dados2',
        simbolo: '•|••',
        celdas: 1,
        turnosDesbloqueo: [6],
        columna: 2,
        fila: 2
    },
    x: {
        id: 'x',
        simbolo: '✖',
        celdas: [
            { color: '#78909c' },  // 0: Gris (Turno 4)
            { color: '#1e88e5' },  // 1: Azul (Amarilla F0)
            { color: '#1e88e5' },  // 2: Azul (Verde)
            { color: '#1e88e5' },  // 3: Azul (Morado)
            { color: '#43a047' },  // 4: Verde (Amarilla F2)
            { color: '#43a047' },  // 5: Verde (Azul Col2)
            { color: '#43a047' },  // 6: Verde (Morado)
            { color: '#fdd835' },  // 7: Amarilla (Azul F1)
            { color: '#fdd835' },  // 8: Amarilla (Naranja)
            { color: '#fdd835' }   // 9: Amarilla (Morado)
        ],
        turnosDesbloqueo: [4],
        columna: 2,
        fila: 0
    },
    seis: {
        id: 'seis',
        simbolo: '#',
        celdas: [
            { color: '#78909c' },  // 0: Gris (Turno 4)
            { color: '#ff6f00' },  // 1: Naranja (Amarilla F1)
            { color: '#ff6f00' },  // 2: Naranja (Azul F0)
            { color: '#ff6f00' },  // 3: Naranja (Morado)
            { color: '#7b1fa2' },  // 4: Morado (Azul Col3)
            { color: '#7b1fa2' },  // 5: Morado (Verde)
            { color: '#7b1fa2' }   // 6: Morado (Naranja)
        ],
        turnosDesbloqueo: [4],
        columna: 2,
        fila: 1
    }
};

// Estado
let turnosCompletados = [];
let desbloqueosExternos = {};

// ============================================================
// INICIALIZACIÓN
// ============================================================

function inicializarAreaGris() {
    const container = document.getElementById('area-gris-content');
    if (!container) return;
    
    let html = `
        <div class="gris-section">
            <div class="gris-turnos">
                <div class="gris-etiqueta">Turnos</div>
                <div class="gris-turnos-grid">
    `;
    
    TURNOS_CONFIG.forEach((turno, index) => {
        const id = `gris-turno-${index}`;
        const estaMarcado = historialMovimientos.includes(id);
        const claseMarcada = estaMarcado ? 'marcada' : '';
        html += `
            <div class="gris-turno-cell ${claseMarcada}" 
                 data-area="gris" 
                 data-fila="turno" 
                 data-col="${index}"
                 data-id="${id}"
                 data-turno="${turno.numero}"
                 data-bonificacion="${turno.bonificacion}"
                 onclick="manejarClickTurnoGris(${index})">
                <span class="turno-numero">${turno.numero}</span>
                <span class="turno-bonificacion">${turno.bonificacion}</span>
            </div>
        `;
    });
    
    html += `
                </div>
            </div>
            <div class="gris-habilidades">
                <div class="gris-etiqueta">Habilidades</div>
                <div class="gris-habilidades-grid">
    `;
    
    html += `<div class="gris-columna">`;
    html += generarFilaHabilidad('espiral');
    html += generarFilaHabilidad('mas1');
    html += generarFilaHabilidad('dados1');
    html += `</div>`;
    
    html += `<div class="gris-columna">`;
    html += generarFilaHabilidad('x');
    html += generarFilaHabilidad('seis');
    html += generarFilaHabilidad('dados2');
    html += `</div>`;
    
    html += `
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    actualizarEstadosGris();
}

// ============================================================
// GENERAR FILAS DE HABILIDADES
// ============================================================

function generarFilaHabilidad(habilidadId) {
    const config = HABILIDADES_CONFIG[habilidadId];
    if (!config) return '';
    
    let html = `<div class="gris-fila-habilidad" data-habilidad="${habilidadId}">`;
    html += `<span class="habilidad-simbolo">${config.simbolo}</span>`;
    
    if (Array.isArray(config.celdas)) {
        config.celdas.forEach((celda, index) => {
            const id = `gris-${habilidadId}-${index}`;
            const estaMarcada = historialMovimientos.includes(id);
            const estaDesbloqueada = estaDesbloqueadaGris(habilidadId, index);
            const claseEstado = estaMarcada ? 'usada' : (estaDesbloqueada ? 'desbloqueada' : 'bloqueada');
            
            const bgColor = celda.color || '#3a3a3a';
            
            html += `
                <div class="celda-habilidad ${claseEstado}" 
                     data-area="gris"
                     data-fila="${habilidadId}"
                     data-col="${index}"
                     data-id="${id}"
                     data-habilidad="${habilidadId}"
                     data-color="${bgColor}"
                     onclick="manejarClickHabilidadGris('${habilidadId}', ${index})"
                     style="background-color: ${bgColor};">
                    ${estaMarcada ? '✓' : ''}
                </div>
            `;
        });
    } else {
        for (let i = 0; i < config.celdas; i++) {
            const id = `gris-${habilidadId}-${i}`;
            const estaMarcada = historialMovimientos.includes(id);
            const estaDesbloqueada = estaDesbloqueadaGris(habilidadId, i);
            const claseEstado = estaMarcada ? 'usada' : (estaDesbloqueada ? 'desbloqueada' : 'bloqueada');
            
            html += `
                <div class="celda-habilidad celda-vacia ${claseEstado}" 
                     data-area="gris"
                     data-fila="${habilidadId}"
                     data-col="${i}"
                     data-id="${id}"
                     data-habilidad="${habilidadId}"
                     onclick="manejarClickHabilidadGris('${habilidadId}', ${i})">
                    ${estaMarcada ? '✓' : ''}
                </div>
            `;
        }
    }
    
    html += `</div>`;
    return html;
}

// ============================================================
// VERIFICAR DESBLOQUEO (CONSIDERANDO EXTERNOS)
// ============================================================

function estaDesbloqueadaGris(habilidadId, index) {
    const config = HABILIDADES_CONFIG[habilidadId];
    if (!config) return false;
    
    const clave = `${habilidadId}-${index}`;
    if (desbloqueosExternos[clave]) {
        return true;
    }
    
    if (config.turnosDesbloqueo && config.turnosDesbloqueo.length > 0) {
        let totalDesbloqueadas = 0;
        config.turnosDesbloqueo.forEach(turnoNum => {
            if (turnosCompletados.includes(turnoNum)) {
                totalDesbloqueadas++;
            }
        });
        return index < totalDesbloqueadas;
    }
    
    return false;
}

// ============================================================
// FUNCIONES DE DESBLOQUEO EXTERNO UNIFICADAS - CON UI ACTUALIZADA
// ============================================================

function desbloquearExterno(habilidadId, indice) {
    const clave = `${habilidadId}-${indice}`;
    desbloqueosExternos[clave] = true;
    
    const selector = `.celda-habilidad[data-habilidad="${habilidadId}"][data-col="${indice}"]`;
    const cell = document.querySelector(selector);
    if (cell) {
        cell.classList.remove('bloqueada');
        cell.classList.add('desbloqueada');
        if (cell.dataset.color) {
            cell.style.opacity = '1';
            cell.style.filter = 'none';
        }
        cell.textContent = '';
        return true;
    }
    return false;
}

function desbloquearSiguienteExterno(habilidadId) {
    const celdas = document.querySelectorAll(`.celda-habilidad[data-habilidad="${habilidadId}"].bloqueada`);
    const celdasOrdenadas = Array.from(celdas).sort((a, b) => {
        return parseInt(a.dataset.col) - parseInt(b.dataset.col);
    });
    
    if (celdasOrdenadas.length === 0) return false;
    
    const cell = celdasOrdenadas[0];
    const index = parseInt(cell.dataset.col);
    const clave = `${habilidadId}-${index}`;
    desbloqueosExternos[clave] = true;
    
    cell.classList.remove('bloqueada');
    cell.classList.add('desbloqueada');
    if (cell.dataset.color) {
        cell.style.opacity = '1';
        cell.style.filter = 'none';
    }
    cell.textContent = '';
    return true;
}

// FUNCIONES PÚBLICAS - TODAS USAN desbloqueosExternos Y ACTUALIZAN UI
function desbloquearEspiralExterno(indice) {
    const resultado = indice !== undefined 
        ? desbloquearExterno('espiral', indice)
        : desbloquearSiguienteExterno('espiral');
    
    // Actualizar visuales completos después del desbloqueo
    setTimeout(() => {
        if (typeof actualizarEstadosGris === 'function') {
            actualizarEstadosGris();
        }
        if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
            PUNTAJES.calcularTotal();
        }
        if (typeof renderizarLeaderboard === 'function') {
            renderizarLeaderboard();
        }
    }, 50);
    
    return resultado;
}

function desbloquearMas1Externo(indice) {
    const resultado = indice !== undefined 
        ? desbloquearExterno('mas1', indice)
        : desbloquearSiguienteExterno('mas1');
    
    setTimeout(() => {
        if (typeof actualizarEstadosGris === 'function') {
            actualizarEstadosGris();
        }
        if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
            PUNTAJES.calcularTotal();
        }
        if (typeof renderizarLeaderboard === 'function') {
            renderizarLeaderboard();
        }
    }, 50);
    
    return resultado;
}

function desbloquearXExterno(indice) {
    const resultado = desbloquearExterno('x', indice);
    
    setTimeout(() => {
        if (typeof actualizarEstadosGris === 'function') {
            actualizarEstadosGris();
        }
        if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
            PUNTAJES.calcularTotal();
        }
        if (typeof renderizarLeaderboard === 'function') {
            renderizarLeaderboard();
        }
    }, 50);
    
    return resultado;
}

function desbloquearSeisExterno(indice) {
    const resultado = desbloquearExterno('seis', indice);
    
    setTimeout(() => {
        if (typeof actualizarEstadosGris === 'function') {
            actualizarEstadosGris();
        }
        if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
            PUNTAJES.calcularTotal();
        }
        if (typeof renderizarLeaderboard === 'function') {
            renderizarLeaderboard();
        }
    }, 50);
    
    return resultado;
}

// FUNCIÓN GENÉRICA PARA USAR DESDE OTRAS ÁREAS
function desbloquearHabilidadEnGris(habilidadId, indice) {
    const resultado = desbloquearExterno(habilidadId, indice);
    
    // Actualizar visuales completos
    setTimeout(() => {
        if (typeof actualizarEstadosGris === 'function') {
            actualizarEstadosGris();
        }
        if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
            PUNTAJES.calcularTotal();
        }
        if (typeof renderizarLeaderboard === 'function') {
            renderizarLeaderboard();
        }
    }, 50);
    
    return resultado;
}

// ============================================================
// MANEJAR CLICK EN TURNO - CON DESHACER CORREGIDO
// ============================================================

function manejarClickTurnoGris(index) {
    const turno = TURNOS_CONFIG[index];
    const id = `gris-turno-${index}`;
    
    // ============================================================
    // VERIFICAR SI YA ESTÁ MARCADO → INTENTAR DESHACER
    // ============================================================
    if (historialMovimientos.includes(id)) {
        // Intentar deshacer
        if (typeof window.intentarDeshacer === 'function') {
            const resultado = window.intentarDeshacer(id);
            if (resultado && resultado.exito) {
                // El deshacer ya actualizó todo
                return;
            } else {
                // No se pudo deshacer (no es el último movimiento)
                const cell = document.querySelector(`[data-area="gris"][data-fila="turno"][data-col="${index}"]`);
                if (typeof window.mostrarFeedbackError === 'function') {
                    window.mostrarFeedbackError(cell);
                }
                return;
            }
        }
        return;
    }
    
    // ============================================================
    // SI NO ESTÁ MARCADO → VERIFICAR ORDEN Y MARCAR
    // ============================================================
    
    // Validación de orden: solo se puede marcar en secuencia
    if (index > 0) {
        const anterior = `gris-turno-${index - 1}`;
        if (!historialMovimientos.includes(anterior)) {
            // Mostrar feedback de que no se puede marcar fuera de orden
            const cell = document.querySelector(`[data-area="gris"][data-fila="turno"][data-col="${index}"]`);
            if (cell) {
                cell.style.borderColor = '#ff4444';
                setTimeout(() => {
                    cell.style.borderColor = '';
                }, 500);
            }
            return;
        }
    }
    
    // Marcar el turno
    historialMovimientos.push(id);
    turnosCompletados.push(turno.numero);
    
    // ============================================================
    // GUARDAR ACCIÓN PARA DESHACER
    // ============================================================
    if (typeof window.guardarAccion === 'function') {
        window.guardarAccion('turno', id, 'gris', {
            turno: turno.numero,
            index: index
        });
    }
    
    // Actualizar visual de la celda de turno
    const cell = document.querySelector(`[data-area="gris"][data-fila="turno"][data-col="${index}"]`);
    if (cell) cell.classList.add('marcada');
    
    // ACTUALIZAR SOLO LAS CASILLAS QUE CORRESPONDEN A ESTE TURNO
    actualizarDesbloqueosPorTurno(turno.numero);
    
    recalcularPuntajes();
    actualizarVisuales();
    
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
}

// ============================================================
// RECONSTRUIR TURNOS COMPLETADOS DESDE EL HISTORIAL
// ============================================================

function reconstruirTurnosCompletados() {
    turnosCompletados = [];
    TURNOS_CONFIG.forEach((turno, index) => {
        const id = `gris-turno-${index}`;
        if (historialMovimientos.includes(id)) {
            turnosCompletados.push(turno.numero);
        }
    });
}

// ============================================================
// ACTUALIZAR DESBLOQUEOS POR TURNO (sin resetear externos)
// ============================================================

function actualizarDesbloqueosPorTurno(turnoNumero) {
    // Para cada habilidad, verificar si este turno la desbloquea
    Object.keys(HABILIDADES_CONFIG).forEach(habilidadId => {
        const config = HABILIDADES_CONFIG[habilidadId];
        if (!config.turnosDesbloqueo) return;
        
        // Verificar cuántos turnos de desbloqueo están completados
        let totalDesbloqueados = 0;
        config.turnosDesbloqueo.forEach(turno => {
            if (turnosCompletados.includes(turno)) {
                totalDesbloqueados++;
            }
        });
        
        // Desbloquear SOLO las casillas que corresponden al nuevo progreso
        // PERO sin sobrescribir las que ya estaban desbloqueadas externamente
        for (let i = 0; i < totalDesbloqueados; i++) {
            const clave = `${habilidadId}-${i}`;
            // Solo desbloquear si NO está ya desbloqueada externamente
            if (!desbloqueosExternos[clave]) {
                const selector = `.celda-habilidad[data-habilidad="${habilidadId}"][data-col="${i}"]`;
                const cell = document.querySelector(selector);
                if (cell && cell.classList.contains('bloqueada')) {
                    cell.classList.remove('bloqueada');
                    cell.classList.add('desbloqueada');
                    if (cell.dataset.color) {
                        cell.style.opacity = '1';
                        cell.style.filter = 'none';
                    }
                    cell.textContent = '';
                }
            }
        }
    });
}

// ============================================================
// MANEJAR CLICK EN HABILIDAD - CON DESHACER CORREGIDO
// ============================================================

function manejarClickHabilidadGris(habilidadId, index) {
    const config = HABILIDADES_CONFIG[habilidadId];
    if (!config) return;
    
    const id = `gris-${habilidadId}-${index}`;
    
    // ============================================================
    // VERIFICAR SI YA ESTÁ MARCADO → INTENTAR DESHACER
    // ============================================================
    if (historialMovimientos.includes(id)) {
        // Intentar deshacer
        if (typeof window.intentarDeshacer === 'function') {
            const resultado = window.intentarDeshacer(id);
            if (resultado && resultado.exito) {
                // El deshacer ya actualizó todo
                actualizarEstadosGris();
                return;
            } else {
                // No se pudo deshacer (no es el último movimiento)
                const cell = document.querySelector(`[data-area="gris"][data-fila="${habilidadId}"][data-col="${index}"]`);
                if (typeof window.mostrarFeedbackError === 'function') {
                    window.mostrarFeedbackError(cell);
                }
                return;
            }
        }
        return;
    }
    
    // ============================================================
    // SI NO ESTÁ MARCADO → VERIFICAR DESBLOQUEO Y MARCAR
    // ============================================================
    
    if (!estaDesbloqueadaGris(habilidadId, index)) return;
    
    historialMovimientos.push(id);
    
    // ============================================================
    // GUARDAR ACCIÓN PARA DESHACER
    // ============================================================
    if (typeof window.guardarAccion === 'function') {
        window.guardarAccion('habilidad', id, 'gris', {
            habilidad: habilidadId,
            index: index
        });
    }
    
    aplicarBonificacionGris(habilidadId);
    
    actualizarEstadosGris();
    recalcularPuntajes();
    actualizarVisuales();
    
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
}

// ============================================================
// ACTUALIZAR ESTADOS DE GRIS (después de deshacer)
// ============================================================

function actualizarEstadosGris() {
    // Reconstruir turnosCompletados desde el historial
    reconstruirTurnosCompletados();
    
    // Actualizar visuales de habilidades
    document.querySelectorAll('.celda-habilidad').forEach(cell => {
        const habilidadId = cell.dataset.habilidad;
        const index = parseInt(cell.dataset.col);
        const id = `gris-${habilidadId}-${index}`;
        const clave = `${habilidadId}-${index}`;
        
        // Si está marcada/usada
        if (historialMovimientos.includes(id)) {
            cell.classList.remove('bloqueada', 'desbloqueada');
            cell.classList.add('usada');
            cell.textContent = '✓';
            return;
        }
        
        // Si está desbloqueada externamente o por turnos
        const estaDesbloqueada = desbloqueosExternos[clave] || estaDesbloqueadaGris(habilidadId, index);
        
        if (estaDesbloqueada) {
            cell.classList.remove('bloqueada', 'usada');
            cell.classList.add('desbloqueada');
            cell.textContent = '';
            if (cell.dataset.color) {
                cell.style.opacity = '1';
                cell.style.filter = 'none';
            }
        } else {
            cell.classList.remove('desbloqueada', 'usada');
            cell.classList.add('bloqueada');
            cell.textContent = '';
            if (cell.dataset.color) {
                cell.style.opacity = '0.3';
                cell.style.filter = 'grayscale(0.8)';
            }
        }
    });
    
    // Actualizar turnos
    document.querySelectorAll('.gris-turno-cell').forEach(cell => {
        const index = parseInt(cell.dataset.col);
        const id = `gris-turno-${index}`;
        if (historialMovimientos.includes(id)) {
            cell.classList.add('marcada');
        } else {
            cell.classList.remove('marcada');
        }
    });
}

// ============================================================
// RECONSTRUIR GRIS COMPLETO - REVERIFICA TODOS LOS DESBLOQUEOS
// ============================================================

function reconstruirGrisCompleto() {
    console.log('🔄 Reconstruyendo Gris completo...');
    
    // 1. Reconstruir turnos desde el historial
    reconstruirTurnosCompletados();
    
    // 2. Limpiar y reconstruir desbloqueos externos desde cero
    desbloqueosExternos = {};
    
    // === AMARILLA ===
    if (typeof bonificacionesAmarilla !== 'undefined' && typeof AMARILLA_CONFIG !== 'undefined') {
        AMARILLA_CONFIG.filas.forEach((config, filaIdx) => {
            const bonifKey = `fila${filaIdx}`;
            if (bonificacionesAmarilla[bonifKey] && config.habilidadGris && config.indiceGris !== undefined) {
                const clave = `${config.habilidadGris}-${config.indiceGris}`;
                desbloqueosExternos[clave] = true;
            }
        });
    }
    
    // === AZUL ===
    if (typeof filasCompletadasAzul !== 'undefined' && typeof BONIFICACIONES_FILA !== 'undefined') {
        BONIFICACIONES_FILA.forEach((bonif, filaIdx) => {
            if (filasCompletadasAzul[filaIdx] && bonif.habilidadGris && bonif.indiceGris !== undefined) {
                const clave = `${bonif.habilidadGris}-${bonif.indiceGris}`;
                desbloqueosExternos[clave] = true;
            }
        });
    }
    if (typeof columnasCompletadasAzul !== 'undefined' && typeof BONIFICACIONES_COLUMNA !== 'undefined') {
        BONIFICACIONES_COLUMNA.forEach((bonif, colIdx) => {
            if (columnasCompletadasAzul[colIdx] && bonif.tipo === 'gris' && bonif.habilidadGris && bonif.indiceGris !== undefined) {
                const clave = `${bonif.habilidadGris}-${bonif.indiceGris}`;
                desbloqueosExternos[clave] = true;
            }
        });
    }
    
    // === VERDE ===
    if (typeof bonificacionesVerde !== 'undefined' && typeof BONUS_MAP !== 'undefined' && typeof BONUS_INDICES !== 'undefined') {
        BONUS_INDICES.forEach((index, bonusIdx) => {
            if (bonificacionesVerde[bonusIdx]) {
                const celda = TABLA_VERDE[index];
                if (celda && celda.bonus) {
                    const info = BONUS_MAP[celda.bonus];
                    if (info && info.tipo !== 'lobo' && info.indiceGris !== undefined) {
                        let habilidadId = info.tipo;
                        if (habilidadId === 'mas1') habilidadId = 'mas1';
                        else if (habilidadId === 'espiral') habilidadId = 'espiral';
                        else if (habilidadId === 'x') habilidadId = 'x';
                        else if (habilidadId === 'seis') habilidadId = 'seis';
                        const clave = `${habilidadId}-${info.indiceGris}`;
                        desbloqueosExternos[clave] = true;
                    }
                }
            }
        });
    }
    
    // === NARANJA ===
    if (typeof bonificacionesNaranja !== 'undefined' && typeof BONUS_INDICES_NARANJA !== 'undefined') {
        BONUS_INDICES_NARANJA.forEach((index, bonusIdx) => {
            if (bonificacionesNaranja[bonusIdx]) {
                const celda = NARANJA_CONFIG[index];
                if (celda && celda.bonus && celda.tipo !== 'lobo' && celda.indiceGris !== undefined) {
                    const clave = `${celda.tipo}-${celda.indiceGris}`;
                    desbloqueosExternos[clave] = true;
                }
            }
        });
    }
    
    // === MORADO ===
    if (typeof bonificacionesMorado !== 'undefined' && typeof BONUS_INDICES_MORADO !== 'undefined') {
        BONUS_INDICES_MORADO.forEach((index, bonusIdx) => {
            if (bonificacionesMorado[bonusIdx]) {
                const celda = MORADO_CONFIG[index];
                if (celda && celda.bonus && celda.tipo !== 'lobo' && celda.indiceGris !== undefined) {
                    const clave = `${celda.tipo}-${celda.indiceGris}`;
                    desbloqueosExternos[clave] = true;
                }
            }
        });
    }
    
    // 3. Actualizar visuales de Gris
    actualizarEstadosGris();
    
    console.log('✅ Gris reconstruido completamente');
}

// ============================================================
// APLICAR BONIFICACIONES
// ============================================================

function aplicarBonificacionGris(habilidadId) {
    switch(habilidadId) {
        case 'espiral':
            puntosBonificacion += 1;
            break;
        case 'mas1':
            puntosBonificacion += 1;
            break;
        case 'dados1':
            break;
        case 'dados2':
            break;
        case 'x':
            puntosBonificacion += 2;
            break;
        case 'seis':
            puntosBonificacion += 2;
            break;
    }
    recalcularPuntajes();
}

// ============================================================
// RECALCULAR PUNTAJES
// ============================================================

function recalcularPuntajes() {
    const marcasGris = historialMovimientos.filter(m => m.startsWith('gris-') && !m.includes('turno')).length;
    
    let puntos = 0;
    if (marcasGris > 0) {
        puntos = marcasGris * (marcasGris + 1) / 2;
    }
    
    puntajesAreas.gris = puntos;
    const element = document.getElementById('score-gris');
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

function resetAreaGris() {
    turnosCompletados = [];
    desbloqueosExternos = {};
    
    document.querySelectorAll('.gris-turno-cell.marcada').forEach(cell => {
        cell.classList.remove('marcada');
    });
    
    actualizarEstadosGris();
}

// ============================================================
// EXPORTAR FUNCIONES
// ============================================================

window.inicializarAreaGris = inicializarAreaGris;
window.resetAreaGris = resetAreaGris;
window.desbloquearEspiralExterno = desbloquearEspiralExterno;
window.desbloquearMas1Externo = desbloquearMas1Externo;
window.desbloquearXExterno = desbloquearXExterno;
window.desbloquearSeisExterno = desbloquearSeisExterno;
window.desbloquearHabilidadEnGris = desbloquearHabilidadEnGris;
window.manejarClickTurnoGris = manejarClickTurnoGris;
window.manejarClickHabilidadGris = manejarClickHabilidadGris;
window.actualizarEstadosGris = actualizarEstadosGris;
window.reconstruirTurnosCompletados = reconstruirTurnosCompletados;
window.reconstruirGrisCompleto = reconstruirGrisCompleto;
window.desbloqueosExternos = desbloqueosExternos;
window.turnosCompletados = turnosCompletados;

console.log('🐺 Área Gris cargada correctamente');