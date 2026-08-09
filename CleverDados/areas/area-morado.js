// ============================================================
// ÁREA MORADO - CLEVERDADOS (CON DESHACER CORREGIDO - VERSIÓN FINAL)
// ============================================================

// Configuración del área morado
const MORADO_CONFIG = [
    { index: 0, valor: '', bonus: null, requiereNumero: true },
    { index: 1, valor: '', bonus: null, requiereNumero: true },
    // index 2: Espiral
    { index: 2, valor: '', bonus: 'Espiral', color: '#78909c', simbolo: '♻', tipo: 'espiral', indiceGris: 5, requiereNumero: true },
    // index 3: XAzul
    { index: 3, valor: '', bonus: 'XAzul', color: '#1e88e5', simbolo: '✖', tipo: 'x', indiceGris: 3, requiereNumero: true },
    // index 4: +1
    { index: 4, valor: '', bonus: '+1', color: '#78909c', simbolo: '+1', tipo: 'mas1', indiceGris: 5, requiereNumero: true },
    // index 5: XAmarillo → AMARILLO (índice 9 en gris - el que funcionaba)
    { index: 5, valor: '', bonus: 'XAmarillo', color: '#fdd835', simbolo: '✖', tipo: 'x', indiceGris: 9, requiereNumero: true },
    // index 6: Lobo
    { index: 6, valor: '', bonus: 'Lobo', color: '#d32f2f', simbolo: '♦', tipo: 'lobo', indiceGris: 0, requiereNumero: true },
    // index 7: Espiral
    { index: 7, valor: '', bonus: 'Espiral', color: '#78909c', simbolo: '♻', tipo: 'espiral', indiceGris: 6, requiereNumero: true },
    // index 8: XVerde → VERDE (índice 6 en gris)
    { index: 8, valor: '', bonus: 'XVerde', color: '#43a047', simbolo: '✖', tipo: 'x', indiceGris: 6, requiereNumero: true },
    // index 9: 6Naranja
    { index: 9, valor: '', bonus: '6Naranja', color: '#ff6f00', simbolo: '6', tipo: 'seis', indiceGris: 3, requiereNumero: true },
    // index 10: +1
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

// Índices que tienen bonificación
const BONUS_INDICES_MORADO = [2, 3, 4, 5, 6, 7, 8, 9, 10];

// Estado de progreso para orden
let progresoMorado = 0;
let ultimoNumeroMorado = null;

// Flag para evitar doble clic después de deshacer
let deshacerEnProgresoMorado = false;

// ============================================================
// INICIALIZACIÓN
// ============================================================

function inicializarAreaMorado() {
    const container = document.getElementById('area-morado-content');
    if (!container) return;
    
    actualizarProgresoMorado();
    
    let html = `<div class="morado-grid">`;
    html += `<div class="morado-tabla-container">`;
    
    // Fila de casillas
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
    
    // Fila de bonificaciones (debajo de cada casilla) - SIEMPRE ESTÁTICAS
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
    
    // Aplicar estado visual inicial
    actualizarVisualesMorado();
}

// ============================================================
// ACTUALIZAR PROGRESO - CORREGIDO
// ============================================================

function actualizarProgresoMorado() {
    // El progreso es la cantidad de casillas marcadas EN ORDEN consecutivo
    let marcadasEnOrden = 0;
    
    if (typeof MORADO_CONFIG !== 'undefined' && MORADO_CONFIG && typeof historialMovimientos !== 'undefined') {
        // Recorrer en orden y contar cuántas están marcadas consecutivamente
        for (let i = 0; i < MORADO_CONFIG.length; i++) {
            const id = `morado-${i}`;
            if (historialMovimientos.includes(id)) {
                marcadasEnOrden++;
            } else {
                // Si encontramos una casilla NO marcada, nos detenemos
                break;
            }
        }
    }
    
    progresoMorado = marcadasEnOrden;
    
    // Actualizar último número
    if (progresoMorado > 0) {
        const ultimoIndex = progresoMorado - 1;
        ultimoNumeroMorado = valoresMorado[ultimoIndex];
    } else {
        ultimoNumeroMorado = null;
    }
    
    console.log(`📊 progresoMorado actualizado: ${progresoMorado}, último número: ${ultimoNumeroMorado}`);
}

// ============================================================
// ACTUALIZAR VISUALES MORADO
// ============================================================

function actualizarVisualesMorado() {
    // Actualizar celdas en el tablero principal
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
            // Restaurar valor original
            if (MORADO_CONFIG[index]) {
                cell.textContent = MORADO_CONFIG[index].valor || '';
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
// ACTUALIZAR ESTADOS DE MORADO - CORREGIDO CON LOBOS
// ============================================================

function actualizarEstadosMorado() {
    console.log('🔄 Actualizando estados de Morado...');
    
    // Recalcular bonificaciones
    BONUS_INDICES_MORADO.forEach((index, bonusIdx) => {
        const id = `morado-${index}`;
        bonificacionesMorado[bonusIdx] = historialMovimientos.includes(id);
        console.log(`  Bonus ${bonusIdx} (índice ${index}): ${bonificacionesMorado[bonusIdx] ? 'ACTIVO ✅' : 'inactivo ❌'}`);
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

function desbloquearEnGrisMorado(habilidadId, indice) {
    console.log(`🔓 Desbloqueando en Gris (Morado): ${habilidadId}-${indice}`);
    
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

function verificarBonificacionMorado(index) {
    const bonusIdx = BONUS_INDICES_MORADO.indexOf(index);
    if (bonusIdx === -1) return;
    if (bonificacionesMorado[bonusIdx]) return;
    
    const celda = MORADO_CONFIG[index];
    if (!celda.bonus) return;
    
    bonificacionesMorado[bonusIdx] = true;
    
    console.log(`✅ Bonificación en Morado índice ${index}: ${celda.bonus}`);
    
    // Si es Lobo, registrar en lugar de desbloquear en Gris
    if (celda.bonus === 'Lobo') {
        // ============================================================
        // REGISTRAR LOBO CON GUARDADO DE ESTADO PARA DESHACER
        // ============================================================
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
// APLICAR BONIFICACIÓN - DESBLOQUEA EN GRIS
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
            // Los lobos ya se manejan en verificarBonificacionMorado
            break;
    }
    
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    } else {
        recalcularPuntajesMorado();
    }
}

// ============================================================
// MANEJAR CLICK EN CELDA - CON DESHACER CORREGIDO
// ============================================================

function manejarClickMorado(index) {
    // SOLO permitir clicks en modo zoom
    if (typeof enModoZoom === 'undefined' || !enModoZoom) {
        return;
    }
    
    // Si hay un deshacer en progreso, ignorar el click
    if (deshacerEnProgresoMorado) {
        console.log('⏳ Deshacer en progreso, ignorando click');
        return;
    }
    
    const celda = MORADO_CONFIG[index];
    const id = `morado-${index}`;
    
    console.log(`🖱️ Click en morado[${index}], id: ${id}`);
    
    // ============================================================
    // VERIFICAR SI YA ESTÁ MARCADA → INTENTAR DESHACER
    // ============================================================
    if (historialMovimientos.includes(id)) {
        console.log(`🔍 Intento deshacer ${id}`);
        
        deshacerEnProgresoMorado = true;
        
        if (typeof window.intentarDeshacer === 'function') {
            const resultado = window.intentarDeshacer(id);
            
            if (resultado && resultado.exito) {
                console.log(`✅ Deshacer exitoso para ${id}`);
                actualizarEstadosMorado();
                actualizarProgresoMorado();
                actualizarVisualesMorado();
                
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
                console.log(`❌ No se pudo deshacer ${id}`);
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
    
    // ============================================================
    // SI NO ESTÁ MARCADA → VERIFICAR ORDEN Y MARCAR
    // ============================================================
    
    console.log(`📋 progresoMorado: ${progresoMorado}, index: ${index}`);
    
    // Verificar si se puede marcar (solo en orden)
    if (index !== progresoMorado) {
        console.log(`⚠️ Fuera de orden: esperaba ${progresoMorado}, recibí ${index}`);
        const cell = document.querySelector(`[data-area="morado"][data-index="${index}"]`);
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
                // Verificar regla de números crecientes
                if (ultimoNumeroMorado !== null && ultimoNumeroMorado !== 6) {
                    if (numero <= ultimoNumeroMorado) {
                        const cell = document.querySelector(`[data-area="morado"][data-index="${index}"]`);
                        if (cell) {
                            cell.style.borderColor = '#ff4444';
                            setTimeout(() => {
                                cell.style.borderColor = '';
                            }, 1000);
                        }
                        alert(`El número debe ser mayor que ${ultimoNumeroMorado}. Si pones 6, se reinicia.`);
                        return;
                    }
                }
                
                // Guardar el valor anterior antes de modificarlo
                const valorAnterior = valoresMorado[index];
                valoresMorado[index] = numero;
                marcarMorado(index, numero, valorAnterior);
            }, titulo, subtitulo);
        } else {
            const numero = prompt('Ingresa un número del 1 al 6:');
            if (numero !== null) {
                const num = parseInt(numero);
                if (num >= 1 && num <= 6) {
                    if (ultimoNumeroMorado !== null && ultimoNumeroMorado !== 6) {
                        if (num <= ultimoNumeroMorado) {
                            alert(`El número debe ser mayor que ${ultimoNumeroMorado}. Si pones 6, se reinicia.`);
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
// MARCAR CASILLA - CON DESHACER
// ============================================================

function marcarMorado(index, numero, valorAnterior) {
    const celda = MORADO_CONFIG[index];
    const id = `morado-${index}`;
    
    if (historialMovimientos.includes(id)) return;
    
    historialMovimientos.push(id);
    valoresMorado[index] = numero;
    
    // ============================================================
    // GUARDAR ACCIÓN PARA DESHACER (con el valor anterior)
    // ============================================================
    if (typeof window.guardarAccion === 'function') {
        window.guardarAccion('numero', id, 'morado', {
            index: index,
            valor: numero,
            valorAnterior: valorAnterior !== undefined ? valorAnterior : null
        });
    }
    
    // Actualizar visuales
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

console.log('🟪 Área Morado cargada correctamente');