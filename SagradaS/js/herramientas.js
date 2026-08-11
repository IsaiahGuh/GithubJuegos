// ===== HERRAMIENTAS.JS =====
// Definición de herramientas del juego y sistema de favores

const HERRAMIENTAS = [
    // 1. Mueve cualquier dado de tu vidriera y ignora las restricciones de color.
    {
        id: 1,
        nombre: "Pincel de Color",
        descripcion: "Mueve cualquier dado de tu vidriera y ignora las restricciones de color.",
        descripcion_corta: "Ignora restricciones de color",
        tipo: "movimiento",
        efecto: "ignorar_color"
    },
    // 2. Mueve cualquier dado de tu vidriera y ignora las restricciones de valor.
    {
        id: 2,
        nombre: "Pincel de Valor",
        descripcion: "Mueve cualquier dado de tu vidriera y ignora las restricciones de valor.",
        descripcion_corta: "Ignora restricciones de valor",
        tipo: "movimiento",
        efecto: "ignorar_valor"
    },
    // 3. Después de coger dado, intercambie un dado con los del track de ronda.
    {
        id: 3,
        nombre: "Intercambio de Dados",
        descripcion: "Después de coger dado, intercambie un dado con los del track de ronda.",
        descripcion_corta: "Intercambia dado con track de ronda",
        tipo: "intercambio",
        efecto: "intercambiar_track"
    },
    // 4. Después de coger dado, aumente o disminuya el valor del dado elegido en 1.
    {
        id: 4,
        nombre: "Ajuste de Dado",
        descripcion: "Después de coger dado, aumente o disminuya el valor del dado elegido en 1. No es posible cambiar de 1 a 6 ó de 6 a 1.",
        descripcion_corta: "Ajusta valor ±1",
        tipo: "modificacion",
        efecto: "ajustar_valor"
    },
    // 5. Mueve dos dados del mismo color que coincidan con el color del track de ronda.
    {
        id: 5,
        nombre: "Movimiento de Color",
        descripcion: "Mueve dos dados del mismo color que coincidan con el color del track de ronda.",
        descripcion_corta: "Mueve 2 dados del mismo color",
        tipo: "movimiento",
        efecto: "mover_color_ronda"
    },
    // 6. Después de coger dado, voltee el dado hacia su lado opuesto.
    {
        id: 6,
        nombre: "Voltear Dado",
        descripcion: "Después de coger dado, voltee el dado hacia su lado opuesto (6↔1, 5↔2, 4↔3).",
        descripcion_corta: "Voltea dado opuesto",
        tipo: "modificacion",
        efecto: "voltear_dado"
    },
    // 7. Después de coger dado puedes relanzarlo.
    {
        id: 7,
        nombre: "Relanzar Dado",
        descripcion: "Después de coger dado puedes relanzarlo. Si no puede ser usado puedes devolverlo.",
        descripcion_corta: "Relanza el dado",
        tipo: "modificacion",
        efecto: "relanzar_dado"
    },
    // 8. Después de coger dado, colóquelo en un lugar que no esté adyacente a otro dado.
    {
        id: 8,
        nombre: "Colocación Aislada",
        descripcion: "Después de coger dado, colóquelo en un lugar que no esté adyacente a otro dado.",
        descripcion_corta: "Coloca sin adyacentes",
        tipo: "colocacion",
        efecto: "no_adyacente"
    },
    // 9. En tu primer turno de la ronda puedes coger un segundo dado.
    {
        id: 9,
        nombre: "Segundo Dado",
        descripcion: "En tu primer turno de la ronda puedes coger un segundo dado. Te saltas al próximo turno de juego.",
        descripcion_corta: "Coge 2 dados en tu turno",
        tipo: "turno",
        efecto: "segundo_dado"
    },
    // 10. Después de coger dado, intercambia 1 dado por otro de la bolsa.
    {
        id: 10,
        nombre: "Intercambio de Bolsa",
        descripcion: "Después de coger dado, intercambia 1 dado por otro de la bolsa. Elije un valor y coloca el dado nuevo en tu vidriera, o regréselo con el resto de dados.",
        descripcion_corta: "Intercambia dado de la bolsa",
        tipo: "intercambio",
        efecto: "intercambiar_bolsa"
    },
    // 11. Puedes volver a tirar los dados.
    {
        id: 11,
        nombre: "Re-tirada",
        descripcion: "Puedes volver a tirar los dados. Solo se puede usar en tu segundo turno después de coger tus dados.",
        descripcion_corta: "Vuelve a tirar dados",
        tipo: "turno",
        efecto: "retirar_dados"
    },
    // 12. Mueve 2 dados, obedece todas las reglas de colocación.
    {
        id: 12,
        nombre: "Movimiento Doble",
        descripcion: "Mueve 2 dados, obedece todas las reglas de colocación.",
        descripcion_corta: "Mueve 2 dados",
        tipo: "movimiento",
        efecto: "movimiento_doble"
    }
];

// ============================================
// ESTADO DEL JUEGO PARA HERRAMIENTAS Y FAVORES
// ============================================

let herramientasState = {
    herramientas_disponibles: [],  // IDs de herramientas disponibles en la ronda
    herramientas_usadas: [],       // IDs de herramientas ya usadas por el jugador local
    herramientas_seleccionadas: [], // IDs de herramientas visibles en el tablero
    // Sistema de favores
    favores: {
        total: 0,           // Favores totales según dificultad de la cartilla
        gastados: 0,        // Favores ya gastados
        disponibles: 0      // Favores restantes
    },
    // Registro de quién usó cada herramienta (para saber si ya fue usada por alguien)
    herramientas_usadas_global: {} // { herramientaId: [jugadorId1, jugadorId2] }
};

// ============================================
// FUNCIONES DE FAVORES
// ============================================

// Inicializar favores según la dificultad de la cartilla
function inicializarFavores(dificultad) {
    const total = dificultad; // Nivel 3 = 3 favores, Nivel 6 = 6 favores
    herramientasState.favores.total = total;
    herramientasState.favores.gastados = 0;
    herramientasState.favores.disponibles = total;
    herramientasState.herramientas_usadas = [];
    
    // Inicializar cada herramienta como no usada por nadie
    herramientasState.herramientas_seleccionadas.forEach(id => {
        if (!herramientasState.herramientas_usadas_global[id]) {
            herramientasState.herramientas_usadas_global[id] = [];
        }
    });
    
    console.log(`🎯 Favores inicializados: ${total} (dificultad ${dificultad})`);
    return herramientasState.favores;
}

// Obtener el estado actual de favores
function getFavoresState() {
    return {
        total: herramientasState.favores.total,
        gastados: herramientasState.favores.gastados,
        disponibles: herramientasState.favores.disponibles
    };
}

// Verificar si se puede usar una herramienta (considerando favores)
function puedeUsarHerramienta(herramientaId, jugadorId) {
    // Verificar si la herramienta ya fue usada por este jugador
    const yaUsadaPorMi = herramientasState.herramientas_usadas.includes(herramientaId);
    
    // Verificar si alguien ya usó esta herramienta globalmente
    const usadaGlobal = herramientasState.herramientas_usadas_global[herramientaId] || [];
    const alguienYaLaUso = usadaGlobal.length > 0;
    
    // Costo: 1 favor si nadie la ha usado, 2 favores si alguien ya la usó
    const costo = alguienYaLaUso ? 2 : 1;
    
    // Verificar si hay suficientes favores disponibles
    if (herramientasState.favores.disponibles < costo) {
        return { 
            puede: false, 
            razon: `No tienes suficientes favores (necesitas ${costo}, tienes ${herramientasState.favores.disponibles})`,
            costo: costo,
            disponible: herramientasState.favores.disponibles
        };
    }
    
    // Verificar si ya fue usada por este jugador
    if (yaUsadaPorMi) {
        return { 
            puede: false, 
            razon: 'Ya usaste esta herramienta',
            costo: costo,
            disponible: herramientasState.favores.disponibles
        };
    }
    
    return { 
        puede: true, 
        razon: 'OK',
        costo: costo,
        disponible: herramientasState.favores.disponibles
    };
}

// Usar una herramienta (con sistema de favores)
function usarHerramientaConFavores(herramientaId, jugadorId) {
    // Verificar si la herramienta ya fue usada por este jugador
    if (herramientasState.herramientas_usadas.includes(herramientaId)) {
        return { success: false, razon: 'Ya usaste esta herramienta' };
    }
    
    // Verificar si la herramienta está disponible
    if (!herramientasState.herramientas_disponibles.includes(herramientaId)) {
        return { success: false, razon: 'Esta herramienta no está disponible' };
    }
    
    // Verificar si alguien ya la usó globalmente
    const usadaGlobal = herramientasState.herramientas_usadas_global[herramientaId] || [];
    const alguienYaLaUso = usadaGlobal.length > 0;
    const costo = alguienYaLaUso ? 2 : 1;
    
    // Verificar favores disponibles
    if (herramientasState.favores.disponibles < costo) {
        return { 
            success: false, 
            razon: `No tienes suficientes favores (necesitas ${costo}, tienes ${herramientasState.favores.disponibles})`,
            costo: costo,
            disponibles: herramientasState.favores.disponibles
        };
    }
    
    // Gastar favores
    herramientasState.favores.gastados += costo;
    herramientasState.favores.disponibles -= costo;
    
    // Registrar que este jugador usó la herramienta
    herramientasState.herramientas_usadas.push(herramientaId);
    
    // Registrar globalmente
    if (!herramientasState.herramientas_usadas_global[herramientaId]) {
        herramientasState.herramientas_usadas_global[herramientaId] = [];
    }
    if (!herramientasState.herramientas_usadas_global[herramientaId].includes(jugadorId)) {
        herramientasState.herramientas_usadas_global[herramientaId].push(jugadorId);
    }
    
    return { 
        success: true, 
        razon: 'Herramienta usada correctamente',
        costo: costo,
        disponibles: herramientasState.favores.disponibles,
        total: herramientasState.favores.total,
        gastados: herramientasState.favores.gastados,
        herramientaId: herramientaId,
        jugadorId: jugadorId
    };
}

// Sincronizar estado de herramientas desde otro jugador
function sincronizarHerramientas(data) {
    if (data.herramientas_usadas_global) {
        herramientasState.herramientas_usadas_global = data.herramientas_usadas_global;
    }
    if (data.favores) {
        herramientasState.favores.total = data.favores.total || herramientasState.favores.total;
        herramientasState.favores.gastados = data.favores.gastados || herramientasState.favores.gastados;
        herramientasState.favores.disponibles = data.favores.disponibles || herramientasState.favores.disponibles;
    }
    if (data.herramientas_usadas) {
        // No sobrescribir las herramientas usadas por el jugador local
        // Solo actualizar las globales
    }
    // Actualizar UI
    if (typeof renderGameInfo === 'function') renderGameInfo();
    if (typeof renderBoard === 'function') renderBoard();
}

// Obtener estado de herramientas para sincronización
function getHerramientasSyncState() {
    return {
        herramientas_usadas_global: herramientasState.herramientas_usadas_global,
        favores: {
            total: herramientasState.favores.total,
            gastados: herramientasState.favores.gastados,
            disponibles: herramientasState.favores.disponibles
        }
    };
}

// Obtener información de una herramienta (si fue usada globalmente)
function getHerramientaInfo(herramientaId) {
    const herramienta = getHerramientaById(herramientaId);
    if (!herramienta) return null;
    
    const usadaGlobal = herramientasState.herramientas_usadas_global[herramientaId] || [];
    const alguienYaLaUso = usadaGlobal.length > 0;
    const yaUsadaPorMi = herramientasState.herramientas_usadas.includes(herramientaId);
    const costo = alguienYaLaUso ? 2 : 1;
    
    return {
        id: herramientaId,
        nombre: herramienta.nombre,
        descripcion: herramienta.descripcion_corta,
        yaUsadaPorMi: yaUsadaPorMi,
        alguienYaLaUso: alguienYaLaUso,
        usuarios: usadaGlobal,
        costo: costo,
        disponible: !yaUsadaPorMi && herramientasState.favores.disponibles >= costo
    };
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

// Obtener una herramienta por ID
function getHerramientaById(id) {
    return HERRAMIENTAS.find(h => h.id === id) || null;
}

// Obtener todas las herramientas
function getAllHerramientas() {
    return HERRAMIENTAS;
}

// Obtener herramientas disponibles en la ronda actual
function getHerramientasDisponibles() {
    return herramientasState.herramientas_disponibles.map(id => getHerramientaById(id)).filter(h => h !== null);
}

// Obtener herramientas visibles en el tablero (3 seleccionadas)
function getHerramientasVisibles() {
    return herramientasState.herramientas_seleccionadas.map(id => getHerramientaById(id)).filter(h => h !== null);
}

// Seleccionar 3 herramientas aleatorias para la ronda
function seleccionarHerramientasParaRonda() {
    const disponibles = [...HERRAMIENTAS];
    const seleccionadas = [];
    const cantidad = Math.min(3, disponibles.length);
    
    for (let i = 0; i < cantidad; i++) {
        const idx = Math.floor(Math.random() * disponibles.length);
        seleccionadas.push(disponibles[idx].id);
        disponibles.splice(idx, 1);
    }
    
    herramientasState.herramientas_seleccionadas = seleccionadas;
    herramientasState.herramientas_disponibles = seleccionadas;
    herramientasState.herramientas_usadas = [];
    
    // Inicializar registro global de herramientas usadas
    herramientasState.herramientas_usadas_global = {};
    seleccionadas.forEach(id => {
        herramientasState.herramientas_usadas_global[id] = [];
    });
    
    return seleccionadas;
}

// Usar una herramienta (versión simple, sin favores - para compatibilidad)
function usarHerramienta(herramientaId) {
    if (herramientasState.herramientas_usadas.includes(herramientaId)) {
        return false;
    }
    if (!herramientasState.herramientas_disponibles.includes(herramientaId)) {
        return false;
    }
    
    herramientasState.herramientas_usadas.push(herramientaId);
    return true;
}

// Verificar si una herramienta está disponible (sin favores)
function isHerramientaDisponible(herramientaId) {
    return herramientasState.herramientas_disponibles.includes(herramientaId) &&
           !herramientasState.herramientas_usadas.includes(herramientaId);
}

// Resetear el estado de herramientas para una nueva ronda
function resetearHerramientas() {
    herramientasState.herramientas_seleccionadas = [];
    herramientasState.herramientas_disponibles = [];
    herramientasState.herramientas_usadas = [];
    herramientasState.favores = { total: 0, gastados: 0, disponibles: 0 };
    herramientasState.herramientas_usadas_global = {};
}

// Obtener la descripción de una herramienta
function getHerramientaDescripcion(herramientaId) {
    const h = getHerramientaById(herramientaId);
    return h ? h.descripcion : "Herramienta no encontrada";
}

// ============================================
// EXPORTAR
// ============================================

window.HERRAMIENTAS = HERRAMIENTAS;
window.herramientasState = herramientasState;
window.getHerramientaById = getHerramientaById;
window.getAllHerramientas = getAllHerramientas;
window.getHerramientasDisponibles = getHerramientasDisponibles;
window.getHerramientasVisibles = getHerramientasVisibles;
window.seleccionarHerramientasParaRonda = seleccionarHerramientasParaRonda;
window.usarHerramienta = usarHerramienta;
window.isHerramientaDisponible = isHerramientaDisponible;
window.resetearHerramientas = resetearHerramientas;
window.getHerramientaDescripcion = getHerramientaDescripcion;
// Nuevas funciones de favores
window.inicializarFavores = inicializarFavores;
window.getFavoresState = getFavoresState;
window.puedeUsarHerramienta = puedeUsarHerramienta;
window.usarHerramientaConFavores = usarHerramientaConFavores;
window.getHerramientaInfo = getHerramientaInfo;
window.sincronizarHerramientas = sincronizarHerramientas;
window.getHerramientasSyncState = getHerramientasSyncState;