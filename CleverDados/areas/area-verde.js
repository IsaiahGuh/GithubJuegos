// ============================================================
// ÁREA VERDE - CLEVERDADOS (CON DESHACER CORREGIDO)
// ============================================================

// Puntajes visuales (siempre estáticos)
const PUNTAJES_VERDE = [1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66];

// Tabla interactiva (11 casillas) - UNA SOLA FILA
const TABLA_VERDE = [
    { valor: '≥1', bonus: null },
    { valor: '≥2', bonus: null },
    { valor: '≥3', bonus: null },
    { valor: '≥4', bonus: '+1' },
    { valor: '≥5', bonus: null },
    { valor: '≥1', bonus: 'XAzul' },
    { valor: '≥2', bonus: 'Lobo' },
    { valor: '≥3', bonus: null },
    { valor: '≥4', bonus: '6Morado' },
    { valor: '≥5', bonus: 'Espiral' },
    { valor: '≥6', bonus: null }
];

// Mapeo de bonificaciones de Verde
const BONUS_MAP = {
    '+1': { color: '#78909c', simbolo: '+1', tipo: 'mas1', indiceGris: 3 },
    'XAzul': { color: '#1e88e5', simbolo: '✖', tipo: 'x', indiceGris: 2 },
    'Lobo': { color: '#d32f2f', simbolo: '♦', tipo: 'lobo', indiceGris: 2 },
    '6Morado': { color: '#7b1fa2', simbolo: '6', tipo: 'seis', indiceGris: 5 },
    'Espiral': { color: '#78909c', simbolo: '♻', tipo: 'espiral', indiceGris: 3 }
};

// Índices que tienen bonificación
const BONUS_INDICES = [3, 5, 6, 8, 9];

// Estado
let progresoVerde = 0;
let bonificacionesVerde = [false, false, false, false, false];

// Flag para evitar doble clic después de deshacer
let deshacerEnProgresoVerde = false;

// ============================================================
// INICIALIZACIÓN
// ============================================================

function inicializarAreaVerde() {
    const container = document.getElementById('area-verde-content');
    if (!container) return;
    
    actualizarProgresoVerde();
    
    let html = `<div class="verde-grid">`;
    
    // --- FILA DE PUNTAJES (VISUAL) - SIEMPRE ESTÁTICOS ---
    html += `<div class="verde-puntajes-fila">`;
    PUNTAJES_VERDE.forEach((puntaje, index) => {
        html += `
            <div class="puntaje-circulo" data-verde-puntaje="${index}" style="opacity:0.5;">
                ${puntaje}
            </div>
        `;
    });
    html += `</div>`;
    
    // --- TABLA INTERACTIVA ---
    html += `<div class="verde-tabla-container">`;
    html += `<div class="verde-fila">`;
    
    TABLA_VERDE.forEach((celda, index) => {
        const id = `verde-tabla-${index}`;
        const estaMarcada = historialMovimientos.includes(id);
        const claseMarcada = estaMarcada ? 'marcada' : '';
        
        html += `
            <div class="verde-celda-wrapper">
                <div class="cell ${claseMarcada}" 
                     data-area="verde"
                     data-index="${index}"
                     data-id="${id}"
                     onclick="manejarClickVerde(${index})">
                    ${celda.valor}
                </div>
            </div>
        `;
    });
    html += `</div>`;
    
    // --- BONIFICACIONES DEBAJO DE CADA CASILLA - SIEMPRE ESTÁTICAS ---
    html += `<div class="verde-bonus-fila">`;
    TABLA_VERDE.forEach((celda, index) => {
        const tieneBonus = celda.bonus !== null && BONUS_MAP[celda.bonus];
        if (tieneBonus) {
            const info = BONUS_MAP[celda.bonus];
            html += `
                <div class="verde-bonus-item">
                    <div class="verde-bonificacion-circulo" 
                         data-bonus-index="${index}"
                         style="background-color: ${info.color}; border-color: ${info.color}; opacity:0.5;">
                        ${info.simbolo}
                    </div>
                </div>
            `;
        } else {
            html += `<div class="verde-bonus-item vacio"></div>`;
        }
    });
    html += `</div>`;
    
    html += `</div>`;
    html += `</div>`;
    
    container.innerHTML = html;
    
    // Aplicar estado visual inicial
    actualizarVisuales();
}

// ============================================================
// ACTUALIZAR PROGRESO - CORREGIDO
// ============================================================

function actualizarProgresoVerde() {
    // El progreso es la cantidad de casillas marcadas EN ORDEN consecutivo
    let marcadasEnOrden = 0;
    
    if (typeof TABLA_VERDE !== 'undefined' && TABLA_VERDE && typeof historialMovimientos !== 'undefined') {
        // Recorrer en orden y contar cuántas están marcadas consecutivamente
        for (let i = 0; i < TABLA_VERDE.length; i++) {
            const id = `verde-tabla-${i}`;
            if (historialMovimientos.includes(id)) {
                marcadasEnOrden++;
            } else {
                // Si encontramos una casilla NO marcada, nos detenemos
                break;
            }
        }
    }
    
    progresoVerde = marcadasEnOrden;
    console.log(`📊 progresoVerde actualizado: ${progresoVerde}`);
}

// ============================================================
// ACTUALIZAR ESTADOS DE VERDE - CORREGIDO CON LOBOS
// ============================================================

function actualizarEstadosVerde() {
    console.log('🔄 Actualizando estados de Verde...');
    
    // Recalcular bonificaciones
    BONUS_INDICES.forEach((index, bonusIdx) => {
        const id = `verde-tabla-${index}`;
        bonificacionesVerde[bonusIdx] = historialMovimientos.includes(id);
        console.log(`  Bonus ${bonusIdx} (índice ${index}): ${bonificacionesVerde[bonusIdx] ? 'ACTIVO ✅' : 'inactivo ❌'}`);
    });
    
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

function desbloquearEnGrisVerde(habilidadId, indice) {
    console.log(`🔓 Desbloqueando en Gris (Verde): ${habilidadId}-${indice}`);
    
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
// VERIFICAR BONIFICACIÓN INDIVIDUAL - CON SOPORTE PARA LOBOS CORREGIDO
// ============================================================

function verificarBonificacionIndividual(index) {
    const bonusIdx = BONUS_INDICES.indexOf(index);
    if (bonusIdx === -1) return;
    if (bonificacionesVerde[bonusIdx]) return;
    
    const celda = TABLA_VERDE[index];
    if (!celda.bonus) return;
    
    bonificacionesVerde[bonusIdx] = true;
    
    console.log(`✅ Bonificación en Verde índice ${index}: ${celda.bonus}`);
    
    // Si es Lobo, registrar en lugar de desbloquear en Gris
    if (celda.bonus === 'Lobo') {
        // ============================================================
        // REGISTRAR LOBO CON GUARDADO DE ESTADO PARA DESHACER
        // ============================================================
        if (typeof registrarLobo === 'function') {
            const cantidadAntes = typeof lobos !== 'undefined' ? lobos.cantidad : 0;
            registrarLobo('verde');
            
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
        aplicarBonificacionVerde(celda.bonus);
    }
}

// ============================================================
// APLICAR BONIFICACIÓN - DESBLOQUEA EN GRIS
// ============================================================

function aplicarBonificacionVerde(bonus) {
    const info = BONUS_MAP[bonus];
    if (!info) return;
    
    const indiceGris = info.indiceGris;
    
    switch(info.tipo) {
        case 'mas1':
            desbloquearEnGrisVerde('mas1', indiceGris);
            break;
        case 'espiral':
            desbloquearEnGrisVerde('espiral', indiceGris);
            break;
        case 'x':
            desbloquearEnGrisVerde('x', indiceGris);
            break;
        case 'seis':
            desbloquearEnGrisVerde('seis', indiceGris);
            break;
        case 'lobo':
            // Los lobos ya se manejan en verificarBonificacionIndividual
            break;
    }
    
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    } else {
        recalcularPuntajesVerde();
    }
}

// ============================================================
// MANEJAR CLICK EN CELDA - CON DESHACER CORREGIDO
// ============================================================

function manejarClickVerde(index) {
    // SOLO permitir clicks en modo zoom
    if (typeof enModoZoom === 'undefined' || !enModoZoom) {
        return;
    }
    
    // Si hay un deshacer en progreso, ignorar el click
    if (deshacerEnProgresoVerde) {
        console.log('⏳ Deshacer en progreso, ignorando click');
        return;
    }
    
    const id = `verde-tabla-${index}`;
    
    console.log(`🖱️ Click en verde[${index}], id: ${id}`);
    
    // ============================================================
    // VERIFICAR SI YA ESTÁ MARCADA → INTENTAR DESHACER
    // ============================================================
    if (historialMovimientos.includes(id)) {
        console.log(`🔍 Intento deshacer ${id}`);
        
        deshacerEnProgresoVerde = true;
        
        if (typeof window.intentarDeshacer === 'function') {
            const resultado = window.intentarDeshacer(id);
            
            if (resultado && resultado.exito) {
                console.log(`✅ Deshacer exitoso para ${id}`);
                actualizarEstadosVerde();
                actualizarProgresoVerde();
                
                // ================================================
                // RECONSTRUIR GRIS - ¡ESTA ES LA LÍNEA CLAVE!
                // ================================================
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
                } else {
                    recalcularPuntajesVerde();
                }
                
                if (typeof renderizarLeaderboard === 'function') {
                    renderizarLeaderboard();
                }
                
                setTimeout(() => {
                    deshacerEnProgresoVerde = false;
                }, 200);
                
                return;
            } else {
                console.log(`❌ No se pudo deshacer ${id}`);
                const cell = document.querySelector(`[data-area="verde"][data-index="${index}"]`);
                if (typeof window.mostrarFeedbackError === 'function') {
                    window.mostrarFeedbackError(cell);
                }
                deshacerEnProgresoVerde = false;
                return;
            }
        }
        
        deshacerEnProgresoVerde = false;
        return;
    }
    
    // ============================================================
    // SI NO ESTÁ MARCADA → VERIFICAR ORDEN Y MARCAR
    // ============================================================
    
    console.log(`📋 progresoVerde: ${progresoVerde}, index: ${index}`);
    
    if (index !== progresoVerde) {
        console.log(`⚠️ Fuera de orden: esperaba ${progresoVerde}, recibí ${index}`);
        const cell = document.querySelector(`[data-area="verde"][data-index="${index}"]`);
        if (cell) {
            cell.style.borderColor = '#ff4444';
            setTimeout(() => {
                cell.style.borderColor = '';
            }, 500);
        }
        return;
    }
    
    // ============================================================
    // MARCAR CASILLA
    // ============================================================
    
    // Marcar la casilla
    historialMovimientos.push(id);
    
    // ============================================================
    // GUARDAR ACCIÓN PARA DESHACER
    // ============================================================
    if (typeof window.guardarAccion === 'function') {
        window.guardarAccion('marcar', id, 'verde', {
            index: index,
            valor: TABLA_VERDE[index].valor
        });
    }
    
    // Actualizar visuales
    actualizarVisuales();
    
    // Actualizar visuales del zoom si está abierto
    if (typeof actualizarVisualesZoom === 'function') {
        actualizarVisualesZoom();
    }
    
    // Actualizar progreso
    actualizarProgresoVerde();
    
    // Verificar bonificación individual (desbloquea en gris o registra lobo)
    verificarBonificacionIndividual(index);
    
    // Recalcular puntajes
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    } else {
        recalcularPuntajesVerde();
    }
    
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
}

// ============================================================
// RECALCULAR PUNTAJES (FALLBACK) - CON PUNTAJE DIRECTO
// ============================================================

function recalcularPuntajesVerde() {
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
        return;
    }
    
    // Puntaje DIRECTO
    let puntos = 0;
    if (progresoVerde > 0 && progresoVerde <= PUNTAJES_VERDE.length) {
        puntos = PUNTAJES_VERDE[progresoVerde - 1];
    }
    
    puntajesAreas.verde = puntos;
    const element = document.getElementById('score-verde');
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

function resetAreaVerde() {
    progresoVerde = 0;
    bonificacionesVerde = [false, false, false, false, false];
    deshacerEnProgresoVerde = false;
    
    document.querySelectorAll('.cell[data-area="verde"]').forEach(cell => {
        cell.classList.remove('marcada');
        cell.style.borderColor = '';
    });
    
    inicializarAreaVerde();
}

// ============================================================
// EXPORTAR
// ============================================================

window.inicializarAreaVerde = inicializarAreaVerde;
window.resetAreaVerde = resetAreaVerde;
window.recalcularPuntajesVerde = recalcularPuntajesVerde;
window.manejarClickVerde = manejarClickVerde;
window.actualizarEstadosVerde = actualizarEstadosVerde;
window.progresoVerde = progresoVerde;
window.bonificacionesVerde = bonificacionesVerde;

console.log('🟩 Área Verde cargada correctamente');