// js/ui.js - INTERFAZ DE USUARIO + MAZO
import { CONFIG, state } from './config.js';
import { robarCarta, reiniciarPartida, guardarReglaEspecial, getCartasRestantes, getDescarte, getReglasVisibles, getUltimaCartaDescartada } from './juego.js';
import { abrirZoom, cerrarZoom } from './zoom.js';
import { getJugadores, getTurnoActual } from './jugadores.js';

// ============================================
// RENDERIZAR UI
// ============================================

export function actualizarUI() {
    const restantes = getCartasRestantes();
    const descarte = getDescarte();
    const reglas = getReglasVisibles();

    // Contadores
    const contadorCartas = document.getElementById('contadorCartas');
    if (contadorCartas) contadorCartas.textContent = restantes;

    const contadorDescarte = document.getElementById('contadorDescarte');
    if (contadorDescarte) contadorDescarte.textContent = descarte.length;

    // Mazo
    const mazoImg = document.getElementById('mazo');
    if (mazoImg) {
        mazoImg.src = CONFIG.UI.IMAGENES_PATH + CONFIG.UI.CARTA_REVERSO;
    }

    // Carta descubierta - mostrar la ultima carta del descarte
    const cartaDescubierta = document.getElementById('cartaDescubierta');
    if (cartaDescubierta) {
        const ultima = getUltimaCartaDescartada();
        if (ultima) {
            cartaDescubierta.src = CONFIG.UI.IMAGENES_PATH + ultima.imagen;
        } else {
            cartaDescubierta.src = CONFIG.UI.IMAGENES_PATH + CONFIG.UI.CARTA_VACIO;
        }
    }

    // Reglas
    mostrarReglas(reglas);
    
    // Actualizar indicador de turno
    actualizarIndicadorTurno();
}

// ============================================
// INDICADOR DE TURNO
// ============================================

function actualizarIndicadorTurno() {
    const jugadores = getJugadores();
    const turno = getTurnoActual();
    const el = document.getElementById('turnoIndicador');
    if (!el) return;
    
    if (jugadores && jugadores.length > 0 && jugadores[turno]) {
        el.textContent = `Turno: ${jugadores[turno].nombre}`;
        el.style.display = 'block';
    } else {
        el.style.display = 'none';
    }
}

// ============================================
// REGLAS
// ============================================

function mostrarReglas(reglas) {
    const container = document.getElementById('reglasContainer');
    if (!container) return;

    container.innerHTML = '';

    for (const regla of reglas) {
        const contenedorRegla = document.createElement('div');
        
        const img = document.createElement('img');
        img.src = CONFIG.UI.IMAGENES_PATH + regla.imagen;
        contenedorRegla.appendChild(img);

        if (regla.textoPersonalizado) {
            const textoDiv = document.createElement('div');
            textoDiv.textContent = regla.textoPersonalizado;
            textoDiv.className = 'regla-texto';
            contenedorRegla.appendChild(textoDiv);
        }

        container.appendChild(contenedorRegla);

        contenedorRegla.addEventListener('click', () => {
            abrirZoom(regla);
        });
    }
}

// ============================================
// MODALES
// ============================================

export function mostrarModalEspecial() {
    const modal = document.getElementById('modalEspecial');
    if (modal) modal.style.display = 'flex';
}

export function ocultarModalEspecial() {
    const modal = document.getElementById('modalEspecial');
    if (modal) {
        modal.style.display = 'none';
        const textarea = document.getElementById('textoRegla');
        if (textarea) textarea.value = '';
    }
}

export function mostrarModalHistorial() {
    const descarte = getDescarte();
    const modal = document.getElementById('modalHistorial');
    const lista = document.getElementById('historialLista');
    if (!modal || !lista) return;

    lista.innerHTML = '';

    if (descarte.length === 0) {
        lista.innerHTML = "<p style='color: white;'>No hay historial para mostrar</p>";
    } else {
        for (const carta of descarte) {
            const contenedor = document.createElement('div');
            contenedor.className = 'historial-item';

            const img = document.createElement('img');
            img.src = CONFIG.UI.IMAGENES_PATH + carta.imagen;
            contenedor.appendChild(img);

            lista.appendChild(contenedor);

            contenedor.addEventListener('click', () => {
                abrirZoom(carta);
            });
        }
    }

    modal.style.display = 'flex';
}

export function ocultarModalHistorial() {
    const modal = document.getElementById('modalHistorial');
    if (modal) modal.style.display = 'none';
}

// ============================================
// MOSTRAR MENSAJES
// ============================================

export function mostrarMensaje(texto, tipo = 'info') {
    const colores = {
        success: '#504E1D',
        error: '#910F13',
        warning: '#CA7A02',
        info: '#1D424C'
    };
    
    const msg = document.createElement('div');
    msg.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colores[tipo] || colores.info};
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        z-index: 9999;
        font-weight: bold;
        animation: slideDown 0.5s ease;
        max-width: 90%;
        text-align: center;
    `;
    msg.textContent = texto;
    document.body.appendChild(msg);
    
    setTimeout(() => {
        if (msg.parentNode) msg.remove();
    }, 3000);
}

// ============================================
// EVENTOS
// ============================================

export function configurarEventos() {
    // Mazo - robar carta y abrir zoom SOLO para el jugador local
    const mazo = document.getElementById('mazo');
    if (mazo) {
        mazo.addEventListener('click', () => {
            const resultado = robarCarta();
            if (resultado) {
                if (resultado.accion === 'especial') {
                    mostrarModalEspecial();
                } else if (resultado.accion === 'oportunidad' || resultado.accion === 'castigo') {
                    mostrarMensaje(
                        resultado.accion === 'oportunidad' ? '¡Oportunidad para el turno actual!' : '¡Castigo para el turno actual!',
                        resultado.accion === 'oportunidad' ? 'success' : 'error'
                    );
                    abrirZoom(resultado.carta);
                } else {
                    abrirZoom(resultado.carta);
                }
            }
        });
    }

    // Carta descubierta - mostrar zoom de la ultima carta descartada
    const cartaDescubierta = document.getElementById('cartaDescubierta');
    if (cartaDescubierta) {
        cartaDescubierta.addEventListener('click', () => {
            const ultima = getUltimaCartaDescartada();
            if (ultima) {
                abrirZoom(ultima);
            }
        });
    }

    // Boton historial
    const btnHistorial = document.querySelector('.btn-historial');
    if (btnHistorial) {
        btnHistorial.addEventListener('click', mostrarModalHistorial);
    }

    // Boton reinicio
    const btnReinicio = document.querySelector('.btn-reiniciar');
    if (btnReinicio) {
        btnReinicio.addEventListener('click', reiniciarPartida);
    }

    // Guardar regla especial
    const guardarBtn = document.getElementById('guardarReglaBtn');
    if (guardarBtn) {
        guardarBtn.addEventListener('click', () => {
            const textarea = document.getElementById('textoRegla');
            if (textarea) {
                const guardado = guardarReglaEspecial(textarea.value);
                if (guardado) {
                    ocultarModalEspecial();
                    mostrarMensaje('Regla especial guardada!', 'success');
                } else {
                    mostrarMensaje('No hay regla especial para guardar', 'warning');
                }
            }
        });
    }

    // Cerrar historial
    const cerrarHistorial = document.getElementById('cerrarHistorialBtn');
    if (cerrarHistorial) {
        cerrarHistorial.addEventListener('click', ocultarModalHistorial);
    }

    // Cerrar zoom
    const cerrarZoomBtn = document.getElementById('cerrarZoomBtn');
    if (cerrarZoomBtn) {
        cerrarZoomBtn.addEventListener('click', () => {
            document.getElementById('modalZoom').style.display = 'none';
        });
    }

    // Cerrar modales al hacer clic fuera
    const modales = ['modalEspecial', 'modalHistorial', 'modalZoom'];
    for (const id of modales) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    if (id === 'modalEspecial') {
                        const textarea = document.getElementById('textoRegla');
                        if (textarea) textarea.value = '';
                    }
                }
            });
        }
    }

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            ocultarModalEspecial();
            ocultarModalHistorial();
            cerrarZoom();
            cerrarModalOtorgar();
        }
    });
}

// Importar cerrarModalOtorgar de otorgar.js
import { cerrarModalOtorgar } from './otorgar.js';