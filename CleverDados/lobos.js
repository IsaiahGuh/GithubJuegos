// ============================================================
// LOBOS.JS - SISTEMA DE BONIFICACIÓN DE LOBOS (CORREGIDO)
// ============================================================

let lobos = {
    cantidad: 0,
    valorActual: 0,
    totalPuntos: 0,
    desbloqueos: [],
    colores: ['amarilla', 'azul', 'verde', 'naranja', 'morado'],
    colorMenor: 'amarilla'
};

let actualizandoLobo = false;
let ultimoValorRegistrado = { cantidad: 0, valor: 0, total: 0, color: 'amarilla' };

// ============================================================
// OBTENER EL COLOR CON MENOS PUNTOS
// ============================================================

function obtenerColorConMenosPuntos() {
    let puntajes = {};
    let menorPuntaje = Infinity;
    let colorMenor = null;
    
    if (typeof puntajesAreas !== 'undefined' && puntajesAreas) {
        lobos.colores.forEach(color => {
            const pts = puntajesAreas[color] || 0;
            puntajes[color] = pts;
        });
    } else {
        lobos.colores.forEach(color => {
            puntajes[color] = 0;
        });
    }
    
    for (const [color, pts] of Object.entries(puntajes)) {
        if (pts < menorPuntaje) {
            menorPuntaje = pts;
            colorMenor = color;
        }
    }
    
    if (colorMenor === null || menorPuntaje === Infinity) {
        colorMenor = 'amarilla';
        menorPuntaje = 0;
    }
    
    lobos.colorMenor = colorMenor;
    
    return {
        color: colorMenor,
        puntaje: menorPuntaje,
        todos: puntajes
    };
}

// ============================================================
// ACTUALIZAR VALOR DEL LOBO - CON PREVENCIÓN DE RECURSIÓN Y LOG SILENCIOSO
// ============================================================

function actualizarValorLobo(silencioso = true) {
    if (actualizandoLobo) return;
    actualizandoLobo = true;
    
    try {
        const info = obtenerColorConMenosPuntos();
        const nuevoValor = {
            cantidad: lobos.cantidad,
            valor: info.puntaje,
            total: lobos.cantidad * info.puntaje,
            color: info.color
        };
        
        lobos.valorActual = info.puntaje;
        lobos.totalPuntos = lobos.cantidad * lobos.valorActual;
        lobos.colorMenor = info.color;
        
        // Solo mostrar log si hay cambios o si se pide explícitamente
        const cambioSignificativo = 
            nuevoValor.cantidad !== ultimoValorRegistrado.cantidad ||
            nuevoValor.valor !== ultimoValorRegistrado.valor ||
            nuevoValor.total !== ultimoValorRegistrado.total ||
            nuevoValor.color !== ultimoValorRegistrado.color;
        
        if (cambioSignificativo || !silencioso) {
            console.log(`🐺 Actualizado: ${lobos.cantidad} lobos × ${lobos.valorActual}pts = ${lobos.totalPuntos}pts (color: ${lobos.colorMenor})`);
            ultimoValorRegistrado = nuevoValor;
        }
    } finally {
        actualizandoLobo = false;
    }
    
    return lobos;
}

// ============================================================
// RECALCULAR LOBOS DESDE BONIFICACIONES (NUEVA FUNCIÓN)
// ============================================================

function recalcularLobosDesdeBonificaciones() {
    if (typeof lobos === 'undefined') return 0;
    
    console.log('🐺 Recalculando lobos desde bonificaciones...');
    
    // Contar cuántas bonificaciones de lobo están activas
    let totalLobos = 0;
    let detalles = [];
    
    // === AMARILLA ===
    if (typeof bonificacionesAmarilla !== 'undefined' && typeof AMARILLA_CONFIG !== 'undefined') {
        for (let i = 0; i < 4; i++) {
            const key = `fila${i}`;
            if (bonificacionesAmarilla[key]) {
                const config = AMARILLA_CONFIG.filas[i];
                if (config && config.bonificacion === 'Lobo') {
                    totalLobos++;
                    detalles.push(`Amarilla F${i}`);
                }
            }
        }
    }
    
    // === AZUL ===
    if (typeof filasCompletadasAzul !== 'undefined' && typeof BONIFICACIONES_FILA !== 'undefined') {
        for (let i = 0; i < BONIFICACIONES_FILA.length; i++) {
            if (filasCompletadasAzul[i]) {
                const config = BONIFICACIONES_FILA[i];
                if (config && config.bonificacion === 'Lobo') {
                    totalLobos++;
                    detalles.push(`Azul F${i}`);
                }
            }
        }
    }
    
    // === VERDE ===
    if (typeof bonificacionesVerde !== 'undefined' && typeof BONUS_INDICES !== 'undefined' && typeof TABLA_VERDE !== 'undefined') {
        BONUS_INDICES.forEach((index, bonusIdx) => {
            if (bonificacionesVerde[bonusIdx]) {
                const celda = TABLA_VERDE[index];
                if (celda && celda.bonus === 'Lobo') {
                    totalLobos++;
                    detalles.push(`Verde I${index}`);
                }
            }
        });
    }
    
    // === NARANJA ===
    if (typeof bonificacionesNaranja !== 'undefined' && typeof BONUS_INDICES_NARANJA !== 'undefined' && typeof NARANJA_CONFIG !== 'undefined') {
        BONUS_INDICES_NARANJA.forEach((index, bonusIdx) => {
            if (bonificacionesNaranja[bonusIdx]) {
                const celda = NARANJA_CONFIG[index];
                if (celda && celda.bonus === 'Lobo') {
                    totalLobos++;
                    detalles.push(`Naranja I${index}`);
                }
            }
        });
    }
    
    // === MORADO ===
    if (typeof bonificacionesMorado !== 'undefined' && typeof BONUS_INDICES_MORADO !== 'undefined' && typeof MORADO_CONFIG !== 'undefined') {
        BONUS_INDICES_MORADO.forEach((index, bonusIdx) => {
            if (bonificacionesMorado[bonusIdx]) {
                const celda = MORADO_CONFIG[index];
                if (celda && celda.bonus === 'Lobo') {
                    totalLobos++;
                    detalles.push(`Morado I${index}`);
                }
            }
        });
    }
    
    // Actualizar el contador de lobos
    lobos.cantidad = totalLobos;
    
    // Recalcular valor
    if (typeof actualizarValorLobo === 'function') {
        actualizarValorLobo(false);
    }
    if (typeof actualizarUI === 'function') {
        actualizarUI();
    }
    
    console.log(`🐺 Lobos recalculados: ${totalLobos} (${detalles.join(', ') || 'ninguno'})`);
    return totalLobos;
}

// ============================================================
// DESBLOQUEAR UN LOBO (SIEMPRE CON LOG)
// ============================================================

function desbloquearLobo(origen = 'desconocido') {
    // Incrementar el contador
    lobos.cantidad++;
    
    lobos.desbloqueos.push({
        timestamp: Date.now(),
        origen: origen,
        numero: lobos.cantidad
    });
    
    console.log(`🐺 Lobo #${lobos.cantidad} desbloqueado desde ${origen}`);
    
    // Forzar log con silencioso=false
    actualizarValorLobo(false);
    actualizarUI();
    
    if (typeof PUNTAJES !== 'undefined' && PUNTAJES) {
        PUNTAJES.calcularTotal();
    }
    
    if (typeof broadcastPuntaje === 'function') {
        broadcastPuntaje('sync');
    }
    
    return lobos;
}

// ============================================================
// REGISTRAR LOBO DESDE OTRAS ÁREAS (CON GUARDADO DE ESTADO)
// ============================================================

function registrarLobo(origen) {
    // Guardar el estado ANTES del lobo
    const cantidadAntes = typeof lobos !== 'undefined' ? lobos.cantidad : 0;
    
    // Desbloquear el lobo
    desbloquearLobo(origen);
    
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
    
    return lobos;
}

// ============================================================
// OBTENER INFORMACIÓN DE LOBOS
// ============================================================

function obtenerInfoLobos() {
    actualizarValorLobo(true); // Silencioso
    return {
        cantidad: lobos.cantidad,
        valorActual: lobos.valorActual,
        totalPuntos: lobos.totalPuntos,
        colorMenor: lobos.colorMenor || null,
        desbloqueos: lobos.desbloqueos,
        colores: lobos.colores
    };
}

// ============================================================
// GENERAR HTML PARA EL TAG DE LOBOS
// ============================================================

function generarTagLobos() {
    actualizarValorLobo(true); // Silencioso
    
    if (lobos.cantidad === 0) {
        return `
            <span class="puntaje-tag lobos-tag" style="border-color: #d32f2f; cursor: default; opacity: 0.6;">
                <span class="tag-dot" style="background: #d32f2f; font-size: 0.8rem; line-height: 1; display: inline-flex; align-items: center; justify-content: center;">
                    ♦
                </span>
                0pts
            </span>
        `;
    }
    
    const info = obtenerColorConMenosPuntos();
    const pts = info.puntaje;
    const total = lobos.cantidad * pts;
    const colorMenor = info.color;
    
    const coloresMap = {
        'amarilla': '#fdd835',
        'azul': '#1e88e5',
        'verde': '#43a047',
        'naranja': '#ff6f00',
        'morado': '#7b1fa2'
    };
    const colorDot = coloresMap[colorMenor] || '#d32f2f';
    
    return `
        <span class="puntaje-tag lobos-tag" style="border-color: #d32f2f; cursor: default;">
            <span class="tag-dot" style="background: ${colorDot}; font-size: 1rem; line-height: 1; display: inline-flex; align-items: center; justify-content: center;">
                ♦
            </span>
            ${lobos.cantidad} × ${pts}pts = ${total}pts
        </span>
    `;
}

// ============================================================
// ACTUALIZAR UI
// ============================================================

function actualizarUI() {
    actualizarValorLobo(true); // Silencioso
    
    const tagsContainer = document.querySelector('.puntajes-tags');
    if (!tagsContainer) return;
    
    const existingTag = tagsContainer.querySelector('.lobos-tag');
    const nuevoTag = generarTagLobos();
    
    if (nuevoTag) {
        if (existingTag) {
            existingTag.outerHTML = nuevoTag;
        } else {
            tagsContainer.insertAdjacentHTML('beforeend', nuevoTag);
        }
    }
}

// ============================================================
// RESET DE LOBOS
// ============================================================

function resetLobos() {
    lobos = {
        cantidad: 0,
        valorActual: 0,
        totalPuntos: 0,
        desbloqueos: [],
        colores: ['amarilla', 'azul', 'verde', 'naranja', 'morado'],
        colorMenor: 'amarilla'
    };
    actualizandoLobo = false;
    ultimoValorRegistrado = { cantidad: 0, valor: 0, total: 0, color: 'amarilla' };
    
    actualizarUI();
    console.log('🐺 Lobos reiniciados');
}

// ============================================================
// INTEGRAR CON EL SISTEMA DE PUNTAJES
// ============================================================

if (typeof PUNTAJES !== 'undefined') {
    const originalCalcularTotal = PUNTAJES.calcularTotal;
    
    PUNTAJES.calcularTotal = function() {
        const total = originalCalcularTotal.call(this);
        actualizarValorLobo(true); // Silencioso
        actualizarUI();
        return total;
    };
    
    const originalObtenerPuntajesPorArea = PUNTAJES.obtenerPuntajesPorArea;
    PUNTAJES.obtenerPuntajesPorArea = function() {
        const result = originalObtenerPuntajesPorArea.call(this);
        result.lobos = {
            cantidad: lobos.cantidad,
            valorActual: lobos.valorActual,
            totalPuntos: lobos.totalPuntos,
            colorMenor: lobos.colorMenor
        };
        return result;
    };
}

// ============================================================
// EXPORTAR
// ============================================================

window.lobos = lobos;
window.desbloquearLobo = desbloquearLobo;
window.registrarLobo = registrarLobo;
window.obtenerInfoLobos = obtenerInfoLobos;
window.generarTagLobos = generarTagLobos;
window.actualizarUI = actualizarUI;
window.resetLobos = resetLobos;
window.obtenerColorConMenosPuntos = obtenerColorConMenosPuntos;
window.actualizarValorLobo = actualizarValorLobo;
window.recalcularLobosDesdeBonificaciones = recalcularLobosDesdeBonificaciones;

console.log('🐺 Sistema de Lobos cargado correctamente');