// js/ui/render.js

// ========== RENDERIZADO DE UI ==========

// ========== CONTADORES ==========
function actualizarContadores() {
    var estado = window.estadoJuego;
    var spanDesafios = document.getElementById("contadorDesafios");
    var spanCartas = document.getElementById("contadorCartas");
    if (spanDesafios) spanDesafios.textContent = estado.mazoDesafio.length;
    if (spanCartas) spanCartas.textContent = estado.mazoNormal.length;
}

// ========== TEMPORIZADORES ==========
function actualizarTemporizadoresUI() {
    var estado = window.estadoJuego;
    var minutosA = Math.floor(estado.tiempoEquipoA / 60);
    var segundosA = estado.tiempoEquipoA % 60;
    var temp1 = document.getElementById("temporizador1");
    if (temp1) {
        temp1.textContent = minutosA.toString().padStart(2, '0') + ":" + segundosA.toString().padStart(2, '0');
        if (estado.tiempoEquipoA <= 5 && estado.tiempoEquipoA > 0) temp1.classList.add("alerta");
        else temp1.classList.remove("alerta");
    }
    
    var minutosB = Math.floor(estado.tiempoEquipoB / 60);
    var segundosB = estado.tiempoEquipoB % 60;
    var temp2 = document.getElementById("temporizador2");
    if (temp2) {
        temp2.textContent = minutosB.toString().padStart(2, '0') + ":" + segundosB.toString().padStart(2, '0');
        if (estado.tiempoEquipoB <= 5 && estado.tiempoEquipoB > 0) temp2.classList.add("alerta");
        else temp2.classList.remove("alerta");
    }
}

// ========== MARCADOR ==========
function actualizarMarcador() {
    var estado = window.estadoJuego;
    var spanA = document.getElementById("desafiosGanadosA");
    var spanB = document.getElementById("desafiosGanadosB");
    
    if (spanA) spanA.textContent = "Desafios: " + estado.desafiosGanadosA;
    if (spanB) spanB.textContent = "Desafios: " + estado.desafiosGanadosB;
    
    var cartasA = estado.cartasCompletadas.filter(function(c) { return c.equipo === 'A'; }).length;
    var cartasB = estado.cartasCompletadas.filter(function(c) { return c.equipo === 'B'; }).length;
    
    var spanCartasA = document.getElementById("cartasCompletadasA");
    var spanCartasB = document.getElementById("cartasCompletadasB");
    
    if (spanCartasA) spanCartasA.textContent = "Cartas: " + cartasA;
    if (spanCartasB) spanCartasB.textContent = "Cartas: " + cartasB;
}

// ========== INDICADOR TURNO ==========
function actualizarIndicadorTurnoJuego(equipo) {
    var btnEquipo1 = document.getElementById("btnEquipo1");
    var btnEquipo2 = document.getElementById("btnEquipo2");
    
    if (btnEquipo1) btnEquipo1.classList.remove("activo");
    if (btnEquipo2) btnEquipo2.classList.remove("activo");
    
    if (equipo === 'A' && btnEquipo1) {
        btnEquipo1.classList.add("activo");
    } else if (equipo === 'B' && btnEquipo2) {
        btnEquipo2.classList.add("activo");
    }
}

// ========== OPCIONES ==========
function mostrarOpciones() {
    var estado = window.estadoJuego;
    var contenedor = document.getElementById("opcionesContainer");
    if (!contenedor) return;
    
    contenedor.innerHTML = "";
    
    if (estado.opcionesVisibles.length === 0) {
        contenedor.innerHTML = "<p style='color:#f5deb2; text-align:center; width:100%; opacity:0.7;'>Esperando nueva ronda...</p>";
        return;
    }
    
    var estadoVisibilidad = window.estadoVisibilidad;
    var equipoLocal = window.estadoJugador?.equipo || 'A';
    
    var miEquipoVe = estadoVisibilidad?.equipoConVisibilidad === equipoLocal;
    var todosVen = estadoVisibilidad?.equipoConVisibilidad === null && !estadoVisibilidad?.forzarOculto;
    var yoVeo = miEquipoVe || todosVen;
    
    for (var i = 0; i < estado.opcionesVisibles.length; i++) {
        var carta = estado.opcionesVisibles[i];
        var div = document.createElement("div");
        div.className = "opcion-carta";
        
        if (!yoVeo) {
            div.classList.add("oculta");
            var img = document.createElement("img");
            img.src = "imagenes/reverso.png";
            img.alt = "Carta oculta";
            div.appendChild(img);
            div.dataset.cartaIndex = i;
        } else {
            var display = window.getCardDisplay(carta);
            
            var tipoDiv = document.createElement("div");
            tipoDiv.className = "carta-tipo";
            tipoDiv.textContent = display.tipoTexto;
            div.appendChild(tipoDiv);
            
            var imgWrapper = document.createElement("div");
            var img2 = document.createElement("img");
            img2.src = "imagenes/" + carta.imagen;
            img2.alt = carta.categoria || "Carta";
            imgWrapper.appendChild(img2);
            div.appendChild(imgWrapper);
            
            var categoriaDiv = document.createElement("div");
            categoriaDiv.className = "carta-categoria";
            categoriaDiv.textContent = display.categoriaTexto;
            div.appendChild(categoriaDiv);
        }
        
        div.addEventListener("click", (function(carta, i) {
            return function() {
                if (!yoVeo) {
                    window.mostrarMensaje("Aviso", "No puedes ver las cartas, espera tu turno.");
                    return;
                }
                if (estado.cartasVisibles) {
                    if (window.abrirSelectorCelda) window.abrirSelectorCelda(carta, i);
                } else {
                    window.mostrarMensaje("Aviso", "Las cartas estan ocultas. Presiona 'Mostrar Cartas' para continuar.");
                }
            };
        })(carta, i));
        contenedor.appendChild(div);
    }
}

// ========== SELECCION DE CELDA ==========
function abrirSelectorCelda(carta, indice) {
    var estado = window.estadoJuego;
    if (estado.desafioActivo) {
        window.mostrarMensaje("Aviso", "Espera a que termine la ronda de desafio");
        return;
    }
    
    if (estado.rondaTerminada) {
        window.mostrarMensaje("Aviso", "Esta ronda ya ha terminado. Inicia una nueva ronda.");
        return;
    }
    
    if (window.esModoOnline && window.esModoOnline()) {
        if (estado.turnoJuego !== 'A' && estado.turnoJuego !== 'B') {
            window.mostrarMensaje("Aviso", "Espera a que sea el turno de tu equipo");
            return;
        }
    }
    
    estado.cartaSeleccionada = carta;
    estado.indiceCartaSeleccionada = indice;
    
    var grid = document.getElementById("gridSeleccion");
    if (!grid) return;
    
    grid.innerHTML = "";
    
    var equipos = ['A', 'B'];
    equipos.forEach(function(equipo) {
        var equipoDiv = document.createElement("div");
        equipoDiv.className = "equipo-seleccion";
        equipoDiv.innerHTML = '<h4>Equipo ' + equipo + '</h4><div class="subgrid-seleccion"></div>';
        var subgrid = equipoDiv.querySelector(".subgrid-seleccion");
        
        var celdasEquipo = window.getCeldasEquipo(equipo);
        celdasEquipo.forEach(function(celda) {
            var btn = document.createElement("button");
            btn.className = "celda-opcion";
            if (estado.tableroCeldas[celda.id] !== null) {
                btn.disabled = true;
                btn.innerHTML = celda.nombre + '<br><small>Ocupada</small>';
            } else {
                btn.innerHTML = celda.nombre;
                btn.addEventListener("click", function() {
                    if (window.colocarCartaEnCelda) window.colocarCartaEnCelda(celda.id);
                });
            }
            subgrid.appendChild(btn);
        });
        grid.appendChild(equipoDiv);
    });
    
    var modal = document.getElementById("modalSeleccionCelda");
    if (modal) window.abrirModal(modal);
}

// ========== CERRAR SELECCION ==========
function cerrarSelectorCelda() {
    var modal = document.getElementById("modalSeleccionCelda");
    if (modal) window.cerrarModal(modal);
    var estado = window.estadoJuego;
    estado.cartaSeleccionada = null;
    estado.indiceCartaSeleccionada = null;
}

// ========== ZOOM ==========
function mostrarZoom(carta) {
    var modal = document.getElementById("modalZoom");
    var zoomImg = document.getElementById("zoomImg");
    if (!modal || !zoomImg) return;
    
    zoomImg.src = "imagenes/" + carta.imagen;
    
    var tituloZoom = document.querySelector(".zoom-titulo");
    if (!tituloZoom) {
        tituloZoom = document.createElement("div");
        tituloZoom.className = "zoom-titulo";
        var zoomContenido = document.querySelector(".zoom-contenido");
        if (zoomContenido) {
            zoomContenido.insertBefore(tituloZoom, zoomContenido.firstChild);
        }
    }
    
    var display = window.getCardDisplay(carta);
    tituloZoom.innerHTML = '<strong>' + display.tipoTexto + '</strong><br><span style="font-size: 0.9em;">' + display.categoriaTexto + '</span>';
    tituloZoom.style.cssText = "color: #f5deb2; text-align: center; margin-bottom: 10px; font-size: 1.1em; background: rgba(0,0,0,0.3); padding: 8px 15px; border-radius: 20px;";
    
    window.abrirModal(modal);
}

// ===== ASIGNAR AL SCOPE GLOBAL =====
window.actualizarContadores = actualizarContadores;
window.actualizarTemporizadoresUI = actualizarTemporizadoresUI;
window.actualizarMarcador = actualizarMarcador;
window.actualizarIndicadorTurnoJuego = actualizarIndicadorTurnoJuego;
window.mostrarOpciones = mostrarOpciones;
window.abrirSelectorCelda = abrirSelectorCelda;
window.cerrarSelectorCelda = cerrarSelectorCelda;
window.mostrarZoom = mostrarZoom;