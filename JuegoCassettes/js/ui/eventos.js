// js/ui/eventos.js

// ========== EVENTOS DE USUARIO ==========

// ========== FUNCIONES DE HOLD REINICIO ==========
function iniciarHoldReinicio(e) {
    e.preventDefault();
    var estado = window.estadoJuego;
    
    if (estado.holdTimeout) {
        clearTimeout(estado.holdTimeout);
        estado.holdTimeout = null;
    }
    
    estado.holdTimeout = setTimeout(function() {
        estado.holdTimeout = null;
        if (window.inicializarJuego) window.inicializarJuego();
        window.location.reload();
    }, 2000);
}

function cancelarHoldReinicio(e) {
    var estado = window.estadoJuego;
    if (estado.holdTimeout) {
        clearTimeout(estado.holdTimeout);
        estado.holdTimeout = null;
    }
}

// ========== OCULTAR CARTAS ==========
function toggleOcultarCartas() {
    var estado = window.estadoJuego;
    var equipoLocal = window.estadoJugador?.equipo || 'A';
    var estadoVisibilidad = window.estadoVisibilidad;
    
    if (estadoVisibilidad && estadoVisibilidad.equipoConVisibilidad !== null) {
        if (estadoVisibilidad.equipoConVisibilidad !== equipoLocal) {
            window.mostrarMensaje("Aviso", "No es tu turno, no puedes cambiar la visibilidad.");
            return;
        }
    }
    
    if (estadoVisibilidad && estadoVisibilidad.forzarOculto) {
        window.mostrarMensaje("Aviso", "Las cartas estan ocultas por el juego.");
        return;
    }
    
    estado.cartasVisibles = !estado.cartasVisibles;
    var btn = document.getElementById("btnOcultarCartas");
    
    if (estado.cartasVisibles) {
        btn.textContent = "Ocultar Cartas";
        btn.classList.remove("activo");
    } else {
        btn.textContent = "Mostrar Cartas";
        btn.classList.add("activo");
    }
    
    if (window.mostrarOpciones) window.mostrarOpciones();
    
    for (var i = 0; i < estado.tableroCeldas.length; i++) {
        var carta = estado.tableroCeldas[i];
        if (carta !== null) {
            var celdaDiv = document.querySelector('.celda-juego[data-celda-id="' + i + '"]');
            if (celdaDiv) {
                var img = celdaDiv.querySelector(".carta-contenido img");
                if (img) {
                    if (!estado.cartasVisibles) {
                        img.src = "imagenes/reverso.png";
                        img.classList.add("oculta-tablero");
                    } else {
                        var originalSrc = img.dataset.originalSrc || "imagenes/" + carta.imagen;
                        img.src = originalSrc;
                        img.classList.remove("oculta-tablero");
                    }
                }
            }
        }
    }
}

// ===== ASIGNAR AL SCOPE GLOBAL =====
window.iniciarHoldReinicio = iniciarHoldReinicio;
window.cancelarHoldReinicio = cancelarHoldReinicio;
window.toggleOcultarCartas = toggleOcultarCartas;