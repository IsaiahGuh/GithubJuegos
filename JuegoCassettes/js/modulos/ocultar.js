// js/modulos/ocultar.js

// ========== GESTION DE VISIBILIDAD DE CARTAS ==========

var estadoVisibilidad = {
    equipoConVisibilidad: null,
    forzarOculto: false
};

window.estadoVisibilidad = estadoVisibilidad;

function actualizarVisibilidadSegunTurno() {
    var estado = window.estadoJuego;
    
    var turnoActual = estado.turnoJuego;
    var ganadorDesafio = estado.turnoGanadorDesafio;
    var rondaTerminada = estado.rondaTerminada;
    var desafioActivo = estado.desafioActivo;
    
    if (desafioActivo) {
        setVisibilidadParaTodos(false);
        return;
    }
    
    if (rondaTerminada) {
        setVisibilidadParaTodos(true);
        return;
    }
    
    if (!turnoActual || !ganadorDesafio) {
        setVisibilidadParaTodos(true);
        return;
    }
    
    darVisibilidadAEquipo(turnoActual);
}

function darVisibilidadAEquipo(equipo) {
    estadoVisibilidad.equipoConVisibilidad = equipo;
    estadoVisibilidad.forzarOculto = false;
    
    aplicarVisibilidadUI();
    
    if (window.esModoOnline && window.esModoOnline()) {
        window.enviarAccion('sync_visibilidad', {
            equipoVisible: equipo,
            forzarOculto: false
        });
    }
}

function setVisibilidadParaTodos(visible) {
    if (visible) {
        estadoVisibilidad.equipoConVisibilidad = null;
        estadoVisibilidad.forzarOculto = false;
    } else {
        estadoVisibilidad.forzarOculto = true;
        estadoVisibilidad.equipoConVisibilidad = null;
    }
    
    aplicarVisibilidadUI();
    
    if (window.esModoOnline && window.esModoOnline()) {
        window.enviarAccion('sync_visibilidad', {
            equipoVisible: null,
            forzarOculto: !visible
        });
    }
}

function aplicarVisibilidadUI() {
    var estado = window.estadoJuego;
    var equipoLocal = window.estadoJugador?.equipo || 'A';
    
    var miEquipoVe = estadoVisibilidad.equipoConVisibilidad === equipoLocal;
    var todosVen = estadoVisibilidad.equipoConVisibilidad === null && !estadoVisibilidad.forzarOculto;
    var yoVeo = miEquipoVe || todosVen;
    
    estado.cartasVisibles = yoVeo;
    
    var btn = document.getElementById("btnOcultarCartas");
    if (btn) {
        if (yoVeo) {
            btn.textContent = "Ocultar Cartas";
            btn.classList.remove("activo");
        } else {
            btn.textContent = "Mostrar Cartas";
            btn.classList.add("activo");
        }
    }
    
    if (window.mostrarOpciones) {
        window.mostrarOpciones();
    }
    
    for (var i = 0; i < estado.tableroCeldas.length; i++) {
        var carta = estado.tableroCeldas[i];
        if (carta !== null) {
            var celdaDiv = document.querySelector('.celda-juego[data-celda-id="' + i + '"]');
            if (celdaDiv) {
                var img = celdaDiv.querySelector(".carta-contenido img");
                if (img) {
                    if (!yoVeo) {
                        img.src = "imagenes/reverso.png";
                        img.classList.add("oculta-tablero");
                        img.dataset.originalSrc = "imagenes/" + carta.imagen;
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

function sincronizarVisibilidadRemota(data) {
    if (data.equipoVisible !== undefined) {
        estadoVisibilidad.equipoConVisibilidad = data.equipoVisible;
    }
    if (data.forzarOculto !== undefined) {
        estadoVisibilidad.forzarOculto = data.forzarOculto;
    }
    
    aplicarVisibilidadUI();
}

function puedeVerElEquipo(equipo) {
    if (estadoVisibilidad.forzarOculto) return false;
    if (estadoVisibilidad.equipoConVisibilidad === null) return true;
    return estadoVisibilidad.equipoConVisibilidad === equipo;
}

// ===== ASIGNAR AL SCOPE GLOBAL =====
window.actualizarVisibilidadSegunTurno = actualizarVisibilidadSegunTurno;
window.sincronizarVisibilidadRemota = sincronizarVisibilidadRemota;
window.puedeVerElEquipo = puedeVerElEquipo;