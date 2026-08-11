// js/otorgar.js - Modal para otorgar oportunidades/castigos manualmente
import { getJugadores, otorgarOportunidad, otorgarCastigo } from './jugadores.js';
import { mostrarMensaje } from './ui.js';

// ============================================
// ABRIR MODAL OTORGAR
// ============================================

export function abrirModalOtorgar() {
    const jugadores = getJugadores();
    if (!jugadores || jugadores.length === 0) {
        mostrarMensaje('No hay jugadores en la partida', 'warning');
        return;
    }
    
    // Crear o obtener el modal
    let modal = document.getElementById('modalOtorgar');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalOtorgar';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-contenido otorgar-contenido">
                <h3>Otorgar a Jugador</h3>
                <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:15px;">
                    Selecciona un jugador y elige qué otorgarle
                </p>
                <div id="otorgarLista" class="otorgar-lista"></div>
                <button class="cerrar-btn" onclick="window.cerrarModalOtorgar()" style="margin-top:15px;">Cerrar</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) cerrarModalOtorgar();
        });
    }
    
    renderOtorgarLista();
    modal.style.display = 'flex';
}

// ============================================
// RENDERIZAR LISTA DE JUGADORES EN MODAL
// ============================================

function renderOtorgarLista() {
    const lista = document.getElementById('otorgarLista');
    if (!lista) return;
    
    const jugadores = getJugadores();
    lista.innerHTML = '';
    
    jugadores.forEach((j, index) => {
        const div = document.createElement('div');
        div.className = 'otorgar-item';
        div.innerHTML = `
            <span style="font-weight:bold;font-size:0.9rem;">${j.nombre}</span>
            <span style="font-size:0.7rem;color:var(--text-muted);">
                O: ${j.oportunidades || 0} | C: ${j.castigos || 0}
            </span>
            <div style="display:flex;gap:6px;">
                <button class="btn-otorgar btn-otorgar-oportunidad" 
                        onclick="window.otorgarOportunidadHandler(${index})">
                    + Oportunidad
                </button>
                <button class="btn-otorgar btn-otorgar-castigo" 
                        onclick="window.otorgarCastigoHandler(${index})">
                    + Castigo
                </button>
            </div>
        `;
        lista.appendChild(div);
    });
}

// ============================================
// CERRAR MODAL
// ============================================

export function cerrarModalOtorgar() {
    const modal = document.getElementById('modalOtorgar');
    if (modal) modal.style.display = 'none';
}

// ============================================
// HANDLERS PARA OTORGAR
// ============================================

export function otorgarOportunidadHandler(index) {
    if (otorgarOportunidad(index)) {
        mostrarMensaje('¡Oportunidad otorgada!', 'success');
        renderOtorgarLista();
    }
}

export function otorgarCastigoHandler(index) {
    if (otorgarCastigo(index)) {
        mostrarMensaje('¡Castigo otorgado!', 'error');
        renderOtorgarLista();
    }
}

// ============================================
// EXPONER FUNCIONES GLOBALES
// ============================================

window.abrirModalOtorgar = abrirModalOtorgar;
window.cerrarModalOtorgar = cerrarModalOtorgar;
window.otorgarOportunidadHandler = otorgarOportunidadHandler;
window.otorgarCastigoHandler = otorgarCastigoHandler;