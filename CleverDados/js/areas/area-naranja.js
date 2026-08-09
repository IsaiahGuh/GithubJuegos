// ============================================================
// ÁREA NARANJA - CLEVERDADOS (CON DESHACER CORREGIDO)
// ============================================================

// Configuración del área naranja
const NARANJA_CONFIG = [
    // index 0: Sin bonificación, multiplicador 1
    { index: 0, valor: '', bonus: null, requiereNumero: true, multiplicador: 1 },
    // index 1: Sin bonificación, multiplicador 1
    { index: 1, valor: '', bonus: null, requiereNumero: true, multiplicador: 1 },
    // index 2: Espiral, multiplicador 1
    { index: 2, valor: '', bonus: 'Espiral', color: '#78909c', simbolo: '♻', tipo: 'espiral', indiceGris: 4, requiereNumero: true, multiplicador: 1 },
    // index 3: ×2 (sin bonificación), multiplicador 2
    { index: 3, valor: '×2', bonus: null, requiereNumero: true, multiplicador: 2 },
    // index 4: XAmarilla, multiplicador 1
    { index: 4, valor: '', bonus: 'XAmarilla', color: '#fdd835', simbolo: '✖', tipo: 'x', indiceGris: 8, requiereNumero: true, multiplicador: 1 },
    // index 5: +1 CON ×2, multiplicador 2
    { index: 5, valor: '×2', bonus: '+1', color: '#78909c', simbolo: '+1', tipo: 'mas1', indiceGris: 4, requiereNumero: true, multiplicador: 2 },
    // index 6: Sin bonificación, multiplicador 1
    { index: 6, valor: '', bonus: null, requiereNumero: true, multiplicador: 1 },
    // index 7: Lobo CON ×2, multiplicador 2
    { index: 7, valor: '×2', bonus: 'Lobo', color: '#d32f2f', simbolo: '♦', tipo: 'lobo', indiceGris: 0, requiereNumero: true, multiplicador: 2 },
    // index 8: Sin bonificación, multiplicador 1
    { index: 8, valor: '', bonus: null, requiereNumero: true, multiplicador: 1 },
    // index 9: 6Morado CON ×3, multiplicador 3
    { index: 9, valor: '×3', bonus: '6Morado', color: '#7b1fa2', simbolo: '6', tipo: 'seis', indiceGris: 6, requiereNumero: true, multiplicador: 3 },
    // index 10: Sin bonificación, multiplicador 1
    { index: 10, valor: '', bonus: null, requiereNumero: true, multiplicador: 1 }
];

// Estado
let valoresNaranja = new Array(11).fill(null);
let bonificacionesNaranja = [
    false, // index 2: Espiral
    false, // index 4: XAmarilla
    false, // index 5: +1
    false, // index 7: Lobo
    false  // index 9: 6Morado
];

// Índices que tienen bonificación
const BONUS_INDICES_NARANJA = [2, 4, 5, 7, 9];

// Estado de progreso para orden
let progresoNaranja = 0;

// Flag para evitar doble clic después de deshacer
let deshacerEnProgresoNaranja = false;

// ============================================================
// INICIALIZACIÓN
// ============================================================

function inicializarAreaNaranja() {
    const container = document.getElementById('area-naranja-content');
    if (!container) return;
    
    actualizarProgresoNaranja();
    
    let html = `<div class="naranja-grid">`;
    html += `<div class="naranja-tabla-container">`;
    
    // Fila de casillas
    html += `<div class="naranja-fila">`;
    NARANJA_CONFIG.forEach((celda, index) => {
        const id = `naranja-${index}`;
        const estaMarcada = historialMovimientos.includes(id);
        const valorGuardado = valoresNaranja[index];
        const esMultiplicador = celda.multiplicador > 1;
        const claseMultiplicador = esMultiplicador ? 'multiplicador' : '';
        const tieneBonus = celda.bonus !== null;
        const claseBonus = tieneBonus ? 'bonus-cell' : '';
        
        let displayValor = celda.valor;
        if (estaMarcada && valorGuardado !== null) {
            displayValor = valorGuardado;
        }
        
        html += `
            <div class="naranja-celda-wrapper">
                <div class="cell ${claseMultiplicador} ${claseBonus}" 
                     data-area="naranja"
                     data-index="${index}"
                     data-id="${id}"
                     data-requiere-numero="${celda.requiereNumero}"
                     data-tiene-bonus="${tieneBonus}"
                     data-marcada="${estaMarcada}"
                     onclick="manejarClickNaranja(${index})"
                     style="${estaMarcada ? 'border-color: #4caf50;' : ''}">
                    ${displayValor}
                </div>
            </div>
        `;
    });
    html += `</div>`;
    
    // Fila de bonificaciones (debajo de cada casilla) - SIEMPRE ESTÁTICAS
    html += `<div class="naranja-bonus-fila">`;
    NARANJA_CONFIG.forEach((celda, index) => {
        const tieneBonus = celda.bonus !== null;
        if (tieneBonus) {
            html += `
                <div class="naranja-bonus-item">
                    <div class="naranja-bonificacion-circulo" 
                         data-naranja-bonus="${index}"
                         style="background-color: ${celda.color}; border-color: ${celda.color}; opacity:0.5;">
                        ${celda.simbolo}
                    </div>
                </div>
            `;
        } else {
            html += `<div class="naranja-bonus-item vacio"></div>`;
        }
    });
    html += `</div>`;
    
    html += `</div>`;
    html += `</div>`;
    container.innerHTML = html;
    
    // Actualizar visuales
    actualizarVisuales();
}

// ============================================================
// ACTUALIZAR PROGRESO - CORREGIDO
// ============================================================

function actualizarProgresoNaranja() {
    // El progreso es la cantidad de casillas marcadas EN ORDEN consecutivo
    let marcadasEnOrden = 0;
    
    if (typeof NARANJA_CONFIG !== 'undefined' && NARANJA_CONFIG && typeof historialMovimientos !== 'undefined') {
        // Recorrer en orden y contar cuántas están marcadas consecutivamente
        for (let i = 0; i < NARANJA_CONFIG.length; i++) {
            const id = `naranja-${i}`;
            if (historialMovimientos.includes(id)) {
                marcadasEnOrden++;
            } else {
                // Si encontramos una casilla NO marcada, nos detenemos
                break;
            }
        }
    }
    
    progresoNaranja = marcadasEnOrden;
    console.log(`📊 progresoNaranja actualizado: ${progresoNaranja}`);
}

// ============================================================
// ACTUALIZAR VISUALES NARANJA
// ============================================================

function actualizarVisualesNaranja() {
    // Actualizar celdas en el tablero principal
    document.querySelectorAll('.cell[data-area="naranja"]').forEach(cell => {
        const index = parseInt(cell.dataset.index);
        if (isNaN(index)) return;
        
        const id = `naranja-${index}`;
        const estaMarcada = historialMovimientos.includes(id);
        const valorGuardado = valoresNaranja[index];
        
        if (estaMarcada && valorGuardado !== null && valorGuardado !== undefined) {
            cell.classList.add('marcada');
            cell.textContent = valorGuardado;
            cell.style.borderColor = '#4caf50';
            cell.style.color = '#ffffff';
            cell.dataset.marcada = 'true';
        } else {
            cell.classList.remove('marcada');
            // Restaurar valor original
            if (NARANJA_CONFIG[index]) {
                cell.textContent = NARANJA_CONFIG[index].valor || '';
            }
            cell.style.borderColor = '';
            cell.style.color = '';
            cell.dataset.marcada = 'false';
        }
    });
    
    // Actualizar visuales del zoom si está abierto
    if (typeof actualizarVisualesZoom === 'function') {
        actualizarVisualesZoom();
    }
}

// ============================================================
// ACTUALIZAR ESTADOS DE NARANJA - CORREGIDO CON LOBOS
// ============================================================

function actualizarEstadosNaranja() {
    console.log('🔄 Actualizando estados de Naranja...');
    
    // Recalcular bonificaciones
    BONUS_INDICES_NARANJA.forEach((index, bonusIdx) => {
        const id = `naranja-${index}`;
        bonificacionesNaranja[bonusIdx] = historialMovimientos.includes(id);
        console.log(`  Bonus ${bonusIdx} (índice ${index}): ${bonificacionesNaranja[bonusIdx] ? 'ACTIVO ✅' : 'inactivo ❌'}`);
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

function desbloquearEnGrisNaranja(habilidadId, indice) {
    console.log(`🔓 Desbloqueando en Gris (Naranja): ${habilidadId}-${indice}`);
    
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
// VERIFICAR BONIFICACIÓN - CON SOPORTE PARA LOBOS CORREGIDO
// ============================================================

function verificarBonificacionNaranja(index) {
    const bonusIdx = BONUS_INDICES_NARANJA.indexOf(index);
    if (bonusIdx === -1) return;
    if (bonificacionesNaranja[bonusIdx]) return;
    
    const celda = NARANJA_CONFIG[index];
    if (!celda.bonus) return;
    
    bonificacionesNaranja[bonusIdx] = true;
    
    console.log(`✅ Bonificación en Naranja índice ${index}: ${celda.bonus}`);
    
    // Si es Lobo, registrar en lugar de desbloquear en Gris
    if (celda.bonus === 'Lobo') {
        // ============================================================
        // REGISTRAR LOBO CON GUARDADO DE ESTADO PARA DESHACER
        // ============================================================
        if (typeof registrarLobo === 'function') {
            const cantidadAntes = typeof lobos !== 'undefined' ? lobos.cantidad : 0;
            registrarLobo('naranja');
            
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
        aplicarBonificacionNaranja(celda);
    }
}

// ============================================================
// APLICAR BONIFICACIÓN - DESBLOQUEA EN GRIS
// ============================================================

function aplicarBonificacionNaranja(celda) {
    if (!celda.bonus) return;
    
    switch(celda.tipo) {
        case 'espiral':
            desbloquearEnGrisNaranja('espiral', celda.indiceGris);
            break;
        case 'mas1':
            desbloquearEnGrisNaranja('mas1', celda.indiceGris);
            break;
        case 'x':
            desbloquearEnGrisNaranja('x', celda.indiceGris);
            break;
        case 'seis':
            desbloquearEnGrisNaranja('seis', celda.indiceGris);
            break;
        case 'lobo':
            // Los lobos ya se manejan en verificarBonificacionNaranja
            break;
    }
    
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    } else {
        recalcularPuntajesNaranja();
    }
}

// ============================================================
// MANEJAR CLICK EN CELDA - CON DESHACER CORREGIDO
// ============================================================

function manejarClickNaranja(index) {
    // SOLO permitir clicks en modo zoom
    if (typeof enModoZoom === 'undefined' || !enModoZoom) {
        return;
    }
    
    // Si hay un deshacer en progreso, ignorar el click
    if (deshacerEnProgresoNaranja) {
        console.log('⏳ Deshacer en progreso, ignorando click');
        return;
    }
    
    const celda = NARANJA_CONFIG[index];
    const id = `naranja-${index}`;
    
    console.log(`🖱️ Click en naranja[${index}], id: ${id}`);
    
    // ============================================================
    // VERIFICAR SI YA ESTÁ MARCADA → INTENTAR DESHACER
    // ============================================================
    if (historialMovimientos.includes(id)) {
        console.log(`🔍 Intento deshacer ${id}`);
        
        deshacerEnProgresoNaranja = true;
        
        if (typeof window.intentarDeshacer === 'function') {
            const resultado = window.intentarDeshacer(id);
            
            if (resultado && resultado.exito) {
                console.log(`✅ Deshacer exitoso para ${id}`);
                actualizarEstadosNaranja();
                actualizarProgresoNaranja();
                actualizarVisualesNaranja();
                
                // ================================================
                // RECONSTRUIR GRIS - ¡ESTA ES LA LÍNEA CLAVE!
                // ================================================
                if (typeof window.reconstruirGrisCompleto === 'function') {
                    window.reconstruirGrisCompleto();
                }
                
                if (typeof actualizarVisuales === 'function') {
                    actualizarVisuales();
                }
                
                if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
                    PUNTAJES.calcularTotal();
                } else {
                    recalcularPuntajesNaranja();
                }
                
                if (typeof renderizarLeaderboard === 'function') {
                    renderizarLeaderboard();
                }
                
                setTimeout(() => {
                    deshacerEnProgresoNaranja = false;
                }, 200);
                
                return;
            } else {
                console.log(`❌ No se pudo deshacer ${id}`);
                const cell = document.querySelector(`[data-area="naranja"][data-index="${index}"]`);
                if (typeof window.mostrarFeedbackError === 'function') {
                    window.mostrarFeedbackError(cell);
                }
                deshacerEnProgresoNaranja = false;
                return;
            }
        }
        
        deshacerEnProgresoNaranja = false;
        return;
    }
    
    // ============================================================
    // SI NO ESTÁ MARCADA → VERIFICAR ORDEN Y MARCAR
    // ============================================================
    
    console.log(`📋 progresoNaranja: ${progresoNaranja}, index: ${index}`);
    
    // Verificar si se puede marcar (solo en orden)
    if (index !== progresoNaranja) {
        console.log(`⚠️ Fuera de orden: esperaba ${progresoNaranja}, recibí ${index}`);
        const cell = document.querySelector(`[data-area="naranja"][data-index="${index}"]`);
        if (cell) {
            cell.style.borderColor = '#ff4444';
            setTimeout(() => {
                cell.style.borderColor = '';
            }, 500);
        }
        return;
    }
    
    // Si requiere número, mostrar modal
    if (celda.requiereNumero) {
        console.log(`📱 Mostrando modal numérico para ${id}`);
        const titulo = celda.bonus ? `Marcar ${celda.bonus}` : 'Ingresa el dado';
        const subtitulo = celda.bonus ? `Selecciona el número para obtener ${celda.bonus}` : '¿Qué número obtuviste?';
        
        if (typeof mostrarModalNumerico === 'function') {
            mostrarModalNumerico(function(numero) {
                console.log(`🔢 Número seleccionado: ${numero}`);
                let valorFinal = numero * celda.multiplicador;
                const valorAnterior = valoresNaranja[index];
                valoresNaranja[index] = valorFinal;
                marcarNaranja(index, valorFinal, valorAnterior);
            }, titulo, subtitulo);
        } else {
            const numero = prompt('Ingresa un número del 1 al 6:');
            if (numero !== null) {
                const num = parseInt(numero);
                if (num >= 1 && num <= 6) {
                    let valorFinal = num * celda.multiplicador;
                    const valorAnterior = valoresNaranja[index];
                    valoresNaranja[index] = valorFinal;
                    marcarNaranja(index, valorFinal, valorAnterior);
                }
            }
        }
        return;
    }
}

// ============================================================
// MARCAR CASILLA - CON DESHACER
// ============================================================

function marcarNaranja(index, numero, valorAnterior) {
    const celda = NARANJA_CONFIG[index];
    const id = `naranja-${index}`;
    
    if (historialMovimientos.includes(id)) return;
    
    // Marcar la casilla en el historial
    historialMovimientos.push(id);
    
    // ============================================================
    // GUARDAR ACCIÓN PARA DESHACER (con el valor anterior)
    // ============================================================
    if (typeof window.guardarAccion === 'function') {
        window.guardarAccion('numero', id, 'naranja', {
            index: index,
            valor: numero,
            valorAnterior: valorAnterior !== undefined ? valorAnterior : null
        });
    }
    
    // Actualizar visuales
    actualizarVisualesNaranja();
    
    // Actualizar progreso
    actualizarProgresoNaranja();
    
    // Verificar bonificación (desbloquea en gris o registra lobo)
    verificarBonificacionNaranja(index);
    
    // Recalcular puntajes
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    } else {
        recalcularPuntajesNaranja();
    }
    
    // Actualizar visuales del tablero principal
    actualizarVisuales();
    
    // Sincronizar
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
}

// ============================================================
// RECALCULAR PUNTAJES (FALLBACK)
// ============================================================

function recalcularPuntajesNaranja() {
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
        return;
    }
    
    const marcasNaranja = historialMovimientos ? historialMovimientos.filter(m => m.startsWith('naranja-')).length : 0;
    
    let puntos = 0;
    if (marcasNaranja > 0) {
        puntos = marcasNaranja * (marcasNaranja + 1) / 2;
    }
    
    let multiplicadorTotal = 1;
    if (typeof NARANJA_CONFIG !== 'undefined' && NARANJA_CONFIG) {
        NARANJA_CONFIG.forEach((celda, index) => {
            if (celda.multiplicador > 1) {
                const id = `naranja-${index}`;
                if (historialMovimientos && historialMovimientos.includes(id)) {
                    multiplicadorTotal *= celda.multiplicador;
                }
            }
        });
    }
    
    puntos *= multiplicadorTotal;
    
    puntajesAreas.naranja = puntos;
    const element = document.getElementById('score-naranja');
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

function resetAreaNaranja() {
    valoresNaranja = new Array(11).fill(null);
    bonificacionesNaranja = [false, false, false, false, false];
    progresoNaranja = 0;
    deshacerEnProgresoNaranja = false;
    
    document.querySelectorAll('.cell[data-area="naranja"]').forEach(cell => {
        const index = parseInt(cell.dataset.index);
        cell.textContent = NARANJA_CONFIG[index].valor || '';
        cell.style.borderColor = '';
        cell.dataset.marcada = 'false';
        cell.classList.remove('marcada');
    });
    
    inicializarAreaNaranja();
}

// ============================================================
// EXPORTAR
// ============================================================

window.inicializarAreaNaranja = inicializarAreaNaranja;
window.resetAreaNaranja = resetAreaNaranja;
window.recalcularPuntajesNaranja = recalcularPuntajesNaranja;
window.valoresNaranja = valoresNaranja;
window.actualizarVisualesNaranja = actualizarVisualesNaranja;
window.manejarClickNaranja = manejarClickNaranja;
window.marcarNaranja = marcarNaranja;
window.actualizarEstadosNaranja = actualizarEstadosNaranja;
window.progresoNaranja = progresoNaranja;
window.bonificacionesNaranja = bonificacionesNaranja;

console.log('🟧 Área Naranja cargada correctamente');