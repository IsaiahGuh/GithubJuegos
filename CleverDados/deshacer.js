// ============================================================
// DESHACER.JS - SISTEMA DE DESHACER (VERSIÓN COMPLETA CON LOBOS)
// ============================================================

let pilaMovimientos = [];

// ============================================================
// GUARDAR ACCIÓN
// ============================================================

function guardarAccion(tipo, id, area, datosExtra = {}) {
    pilaMovimientos.push({
        tipo: tipo,
        id: id,
        area: area,
        datos: datosExtra,
        timestamp: Date.now()
    });
    
    if (pilaMovimientos.length > 100) {
        pilaMovimientos.shift();
    }
}

// ============================================================
// ACTUALIZAR ÚLTIMA ACCIÓN (para lobos)
// ============================================================

function actualizarUltimaAccion(extraData) {
    if (pilaMovimientos.length === 0) return;
    const ultimo = pilaMovimientos[pilaMovimientos.length - 1];
    Object.assign(ultimo.datos, extraData);
}

// ============================================================
// VERIFICAR SI ES EL ÚLTIMO MOVIMIENTO
// ============================================================

function esUltimoMovimiento(id) {
    if (pilaMovimientos.length === 0) return false;
    const ultimo = pilaMovimientos[pilaMovimientos.length - 1];
    return ultimo.id === id;
}

// ============================================================
// INTENTAR DESHACER
// ============================================================

function intentarDeshacer(id) {
    if (pilaMovimientos.length === 0) {
        return { exito: false, mensaje: 'No hay movimientos para deshacer' };
    }
    
    if (!esUltimoMovimiento(id)) {
        return { exito: false, mensaje: 'Solo puedes deshacer el último movimiento' };
    }
    
    const movimiento = pilaMovimientos.pop();
    const resultado = ejecutarDeshacer(movimiento);
    
    return {
        exito: resultado,
        movimiento: movimiento,
        mensaje: resultado ? 'Movimiento deshecho' : 'Error al deshacer'
    };
}

// ============================================================
// EJECUTAR DESHACER - CON SOPORTE PARA LOBO
// ============================================================

function ejecutarDeshacer(movimiento) {
    const { tipo, id, area, datos } = movimiento;
    
    console.log(`↩️ Deshaciendo: ${tipo} - ${id} en ${area}`);
    
    try {
        // 1. Siempre remover del historial primero
        if (typeof historialMovimientos !== 'undefined') {
            const index = historialMovimientos.indexOf(id);
            if (index !== -1) {
                historialMovimientos.splice(index, 1);
                console.log(`✅ Eliminado ${id} del historial`);
            } else {
                console.warn(`⚠️ No se encontró ${id} en historial`);
                return false;
            }
        }
        
        // 2. Restaurar datos específicos según el tipo
        switch (tipo) {
            case 'numero':
                restaurarNumero(id, area, datos);
                break;
            case 'turno':
                restaurarTurno(id);
                break;
            case 'marcar_con_lobo':
                restaurarLobo(datos);
                break;
            case 'marcar':
                // Verificar si esta acción otorgó un lobo que debe ser revertido
                if (datos && datos.otorgoLobo) {
                    restaurarLobo({ cantidadAntes: datos.lobosAntes });
                }
                break;
            case 'habilidad':
                // No requieren restauración adicional
                break;
            default:
                console.warn(`⚠️ Tipo desconocido: ${tipo}`);
        }
        
        // 3. RECONSTRUIR GRIS COMPLETO
        if (typeof window.reconstruirGrisCompleto === 'function') {
            window.reconstruirGrisCompleto();
        }
        
        // 4. Actualizar progresos de áreas específicas
        if (area === 'amarilla' && typeof actualizarEstadosAmarilla === 'function') {
            actualizarEstadosAmarilla();
        } else if (area === 'azul' && typeof actualizarEstadosAzul === 'function') {
            actualizarEstadosAzul();
        } else if (area === 'verde' && typeof actualizarEstadosVerde === 'function') {
            actualizarEstadosVerde();
        } else if (area === 'naranja' && typeof actualizarProgresoNaranja === 'function') {
            actualizarProgresoNaranja();
        } else if (area === 'morado' && typeof actualizarProgresoMorado === 'function') {
            actualizarProgresoMorado();
        }
        
        // 5. Recalcular lobos desde bonificaciones (esto asegura consistencia)
        if (typeof window.recalcularLobosDesdeBonificaciones === 'function') {
            window.recalcularLobosDesdeBonificaciones();
        }
        
        // 6. Actualizar visuales
        if (typeof actualizarVisuales === 'function') {
            actualizarVisuales();
        }
        if (typeof actualizarVisualesZoom === 'function') {
            actualizarVisualesZoom();
        }
        
        // 7. Recalcular puntajes
        if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
            PUNTAJES.calcularTotal();
        } else if (typeof calcularPuntajes === 'function') {
            calcularPuntajes();
        }
        
        // 8. Actualizar leaderboard
        if (typeof renderizarLeaderboard === 'function') {
            renderizarLeaderboard();
        }
        
        // 9. Sincronizar
        if (typeof broadcastPuntaje === 'function') {
            broadcastPuntaje('sync');
        }
        
        return true;
    } catch (e) {
        console.error('Error al deshacer:', e);
        return false;
    }
}

// ============================================================
// RESTAURAR NÚMERO (naranja, morado)
// ============================================================

function restaurarNumero(id, area, datos) {
    const partes = id.split('-');
    if (partes.length !== 2) return;
    
    const index = parseInt(partes[1]);
    if (isNaN(index)) return;
    
    const valorAnterior = datos && datos.valorAnterior !== undefined ? datos.valorAnterior : null;
    
    if (area === 'naranja' && typeof valoresNaranja !== 'undefined') {
        valoresNaranja[index] = valorAnterior;
        console.log(`✅ Restaurado valoresNaranja[${index}] = ${valorAnterior}`);
        if (typeof actualizarVisualesNaranja === 'function') {
            actualizarVisualesNaranja();
        }
    } else if (area === 'morado' && typeof valoresMorado !== 'undefined') {
        valoresMorado[index] = valorAnterior;
        console.log(`✅ Restaurado valoresMorado[${index}] = ${valorAnterior}`);
        if (typeof actualizarVisualesMorado === 'function') {
            actualizarVisualesMorado();
        }
    }
}

// ============================================================
// RESTAURAR TURNO (gris)
// ============================================================

function restaurarTurno(id) {
    const partes = id.split('-');
    if (partes.length !== 3 || partes[0] !== 'gris' || partes[1] !== 'turno') return;
    
    const turnoIndex = parseInt(partes[2]);
    if (isNaN(turnoIndex)) return;
    
    if (typeof turnosCompletados !== 'undefined') {
        const turnoNumero = turnoIndex + 1;
        const idx = turnosCompletados.indexOf(turnoNumero);
        if (idx !== -1) {
            turnosCompletados.splice(idx, 1);
            console.log(`✅ Turno ${turnoNumero} restaurado`);
        }
    }
}

// ============================================================
// RESTAURAR LOBO - CORREGIDO
// ============================================================

function restaurarLobo(datos) {
    if (typeof lobos === 'undefined') return;
    
    // Si tenemos el valor exacto de antes, restaurarlo
    if (datos && datos.cantidadAntes !== undefined && datos.cantidadAntes !== null) {
        lobos.cantidad = datos.cantidadAntes;
        console.log(`✅ Lobo restaurado a: ${lobos.cantidad} (desde ${datos.cantidadAntes})`);
    } else if (lobos.cantidad > 0) {
        // Fallback: decrementar en 1
        lobos.cantidad--;
        console.log(`✅ Lobo decrementado a: ${lobos.cantidad}`);
    }
    
    // Recalcular el valor del lobo
    if (typeof actualizarValorLobo === 'function') {
        actualizarValorLobo(false);
    }
    if (typeof actualizarUI === 'function') {
        actualizarUI();
    }
    
    // Actualizar el líderboard
    if (typeof renderizarLeaderboard === 'function') {
        renderizarLeaderboard();
    }
}

// ============================================================
// LIMPIAR PILA
// ============================================================

function limpiarPilaMovimientos() {
    const cantidad = pilaMovimientos.length;
    pilaMovimientos = [];
    if (cantidad > 0) {
        console.log(`🗑️ Pila de movimientos limpiada (${cantidad})`);
    }
}

// ============================================================
// FUNCIONES DE DEPURACIÓN
// ============================================================

function getPilaMovimientos() {
    return [...pilaMovimientos];
}

function getUltimoMovimiento() {
    return pilaMovimientos.length > 0 ? pilaMovimientos[pilaMovimientos.length - 1] : null;
}

function contarMovimientos() {
    return pilaMovimientos.length;
}

// ============================================================
// EXPONER FUNCIONES GLOBALES
// ============================================================

window.guardarAccion = guardarAccion;
window.actualizarUltimaAccion = actualizarUltimaAccion;
window.esUltimoMovimiento = esUltimoMovimiento;
window.intentarDeshacer = intentarDeshacer;
window.limpiarPilaMovimientos = limpiarPilaMovimientos;
window.getPilaMovimientos = getPilaMovimientos;
window.getUltimoMovimiento = getUltimoMovimiento;
window.contarMovimientos = contarMovimientos;
window.restaurarLobo = restaurarLobo;

console.log('↩️ Sistema de deshacer (completo con lobos) cargado correctamente');