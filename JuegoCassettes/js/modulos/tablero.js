// js/modulos/tablero.js

// ========== TABLERO ==========

var CELDAS_INFO = window.getCeldasInfo();

function puedeCompletar(equipo, celdaId) {
    var estado = window.estadoJuego;
    var infoCelda = CELDAS_INFO.find(function(c) { return c.id === celdaId; });
    if (!infoCelda) return false;
    
    var esGanador = estado.turnoGanadorDesafio === equipo;
    var esPerdedor = estado.turnoGanadorDesafio !== null && 
                       estado.turnoGanadorDesafio !== equipo;
    
    if (esGanador) {
        var tieneTiempo = (equipo === 'A' && estado.tiempoEquipoA > 0) ||
                           (equipo === 'B' && estado.tiempoEquipoB > 0);
        
        if (tieneTiempo && estado.tiempoCorriendo) {
            var celdasEquipo = window.getCeldasEquipo(equipo);
            var celdasPropiasOcupadas = 0;
            celdasEquipo.forEach(function(celda) {
                if (estado.tableroCeldas[celda.id] !== null) {
                    celdasPropiasOcupadas++;
                }
            });
            
            if (infoCelda.equipo !== equipo) {
                return celdasPropiasOcupadas === 0;
            }
            return true;
        }
        return false;
    }
    
    if (esPerdedor) {
        var tieneTiempo2 = (equipo === 'A' && estado.tiempoEquipoA > 0) ||
                           (equipo === 'B' && estado.tiempoEquipoB > 0);
        
        if (tieneTiempo2 && estado.tiempoCorriendo) {
            return infoCelda.equipo === equipo;
        }
        return false;
    }
    
    var tieneTiempoGanador = (equipo === 'A' && estado.tiempoEquipoA === 60) ||
                              (equipo === 'B' && estado.tiempoEquipoB === 60);
    
    if (tieneTiempoGanador || (equipo === estado.turnoJuego && estado.tiempoCorriendo)) {
        var cartasPropias = estado.tableroCeldas.filter(function(_, idx) { 
            return CELDAS_INFO[idx].equipo === equipo && _ !== null;
        }).length;
        
        if (cartasPropias > 0 && infoCelda.equipo !== equipo) {
            return false;
        }
        return true;
    } else {
        return infoCelda.equipo === equipo;
    }
}

function completarCarta(celdaId, cartaData) {
    var estado = window.estadoJuego;
    
    if (!estado.tiempoCorriendo) {
        window.mostrarMensaje("Aviso", "El tiempo no ha iniciado. Presiona el boton de turno de tu equipo.");
        return;
    }
    
    if (!estado.cartasVisibles) {
        window.mostrarMensaje("Aviso", "Las cartas estan ocultas. Presiona 'Mostrar Cartas' para continuar.");
        return;
    }
    
    if (estado.rondaTerminada) {
        window.mostrarMensaje("Ronda Terminada", "Esta ronda ya ha terminado. Inicia una nueva ronda.");
        return;
    }
    
    var infoCelda = CELDAS_INFO.find(function(c) { return c.id === celdaId; });
    if (!infoCelda) {
        window.mostrarMensaje("Error", "Celda no encontrada");
        return;
    }
    
    if (!puedeCompletar(estado.turnoJuego, celdaId)) {
        var esGanador = estado.turnoGanadorDesafio === estado.turnoJuego;
        if (esGanador) {
            window.mostrarMensaje("Aviso", "Equipo " + estado.turnoJuego + " (Ganador): Puedes completar TODAS las cartas del tablero.");
        } else {
            window.mostrarMensaje("Aviso", "Equipo " + estado.turnoJuego + " (Perdedor): Solo puedes completar tus propias cartas.");
        }
        return;
    }
    
    var equipo = estado.turnoJuego;
    var data = window.getEquipoData(equipo);
    var categorias = data.categorias;
    var extras = data.extras;
    
    var yaCompletada = categorias.some(function(c) { return c.tipo === cartaData.tipo && c.categoria === cartaData.categoria; });
    var key = cartaData.tipo + "_" + cartaData.categoria;
    
    if (yaCompletada) {
        extras[key] = (extras[key] || 0) + 1;
        window.setEquipoData(equipo, { extras: extras });
    } else {
        categorias.push({
            tipo: cartaData.tipo,
            categoria: cartaData.categoria
        });
        window.setEquipoData(equipo, { categorias: categorias });
    }
    
    var cartaCompleta = Object.assign({}, cartaData, {
        equipo: equipo,
        categoria: infoCelda.categoria,
        completadoEn: new Date().toLocaleTimeString()
    });
    
    estado.cartasCompletadas.push(cartaCompleta);
    estado.tableroCeldas[celdaId] = null;
    
    window.agregarTiempo(10);
    
    actualizarCeldaVisual(celdaId, null);
    window.actualizarMarcador();
    
    if (window.actualizarLeaderboard) {
        window.actualizarLeaderboard();
    }
    
    if (window.esModoOnline && window.esModoOnline()) {
        window.enviarAccion('completar_carta', {
            celdaId: celdaId,
            carta: cartaData,
            equipo: equipo,
            tableroCeldas: estado.tableroCeldas,
            cartasCompletadas: estado.cartasCompletadas,
            desafiosGanadosA: estado.desafiosGanadosA,
            desafiosGanadosB: estado.desafiosGanadosB
        });
        
        setTimeout(function() {
            var stats = window.calcularPuntuacionEquipo ? 
                window.calcularPuntuacionEquipo(equipo) : { total: 0, desafios: 0, cartas: 0 };
            
            window.enviarAccion('actualizar_puntuacion', {
                equipo: equipo,
                puntuacion: stats.total,
                desafios: stats.desafios,
                cartas: stats.cartas
            });
            
            if (window.renderizarLeaderboard) {
                window.renderizarLeaderboard();
            }
        }, 100);
        
        if (window.syncTiempo) {
            window.syncTiempo();
        }
    }
    
    window.verificarCompletarTodoYDetenerTiempo(equipo);
    window.actualizarVisibilidadSegunTurno();
    window.verificarVictoria(equipo);
    
    if (window.actualizarLeaderboard) {
        setTimeout(function() { window.actualizarLeaderboard(); }, 200);
    }
}

function colocarCartaEnCelda(celdaId) {
    var estado = window.estadoJuego;
    if (estado.desafioActivo) {
        window.mostrarMensaje("Aviso", "Espera a que termine la ronda de desafio");
        return;
    }
    
    if (estado.rondaTerminada) {
        window.mostrarMensaje("Aviso", "Esta ronda ya ha terminado. Inicia una nueva ronda.");
        return;
    }
    
    if (estado.turnoGanadorDesafio) {
        if (estado.turnoJuego !== estado.turnoGanadorDesafio) {
            window.mostrarMensaje("Aviso", "Solo el equipo ganador del desafio puede colocar cartas");
            return;
        }
    } else {
        if (estado.turnoJuego !== 'A' && estado.turnoJuego !== 'B') {
            window.mostrarMensaje("Aviso", "Espera a que sea el turno de tu equipo");
            return;
        }
    }
    
    if (window.esModoOnline && window.esModoOnline()) {
        if (estado.turnoJuego !== window.estadoJugador.equipo) {
            window.mostrarMensaje("Aviso", "Espera a que sea el turno de tu equipo");
            return;
        }
    }
    
    if (estado.tableroCeldas[celdaId] === null && estado.cartaSeleccionada !== null) {
        var infoCelda = CELDAS_INFO.find(function(c) { return c.id === celdaId; });
        if (infoCelda) {
            var esGanador = estado.turnoGanadorDesafio === estado.turnoJuego;
            var esPerdedor = estado.turnoGanadorDesafio !== null && 
                               estado.turnoGanadorDesafio !== estado.turnoJuego;
            
            if (esPerdedor) {
                window.mostrarMensaje("Aviso", "El equipo perdedor no puede colocar cartas");
                return;
            }
        }
        
        var cartaColocada = estado.cartaSeleccionada;
        var indiceCarta = estado.indiceCartaSeleccionada;
        
        estado.tableroCeldas[celdaId] = cartaColocada;
        actualizarCeldaVisual(celdaId, cartaColocada);
        estado.opcionesVisibles.splice(indiceCarta, 1);
        window.mostrarOpciones();
        
        if (window.esModoOnline && window.esModoOnline()) {
            window.enviarAccion('colocar_carta', {
                celdaId: celdaId,
                carta: cartaColocada,
                opcionesVisibles: estado.opcionesVisibles,
                tableroCeldas: estado.tableroCeldas
            });
        }
        
        estado.cartaSeleccionada = null;
        estado.indiceCartaSeleccionada = null;
    }
    window.cerrarSelectorCelda();
}

function actualizarCeldaVisual(celdaId, cartaData) {
    var estado = window.estadoJuego;
    var celdaDiv = document.querySelector('.celda-juego[data-celda-id="' + celdaId + '"]');
    if (!celdaDiv) return;
    
    var contenedorCarta = celdaDiv.querySelector(".carta-contenido");
    if (!contenedorCarta) return;
    
    contenedorCarta.innerHTML = "";
    
    var btnViejo = celdaDiv.querySelector(".btn-completar");
    if (btnViejo) btnViejo.remove();
    
    celdaDiv.classList.remove("completada");
    celdaDiv.classList.remove("ocupada");
    
    if (cartaData) {
        var display = window.getCardDisplay(cartaData);
        
        var tipoDiv = document.createElement("div");
        tipoDiv.className = "carta-tipo";
        tipoDiv.textContent = display.tipoTexto;
        contenedorCarta.appendChild(tipoDiv);
        
        var imgWrapper = document.createElement("div");
        var img = document.createElement("img");
        img.src = "imagenes/" + cartaData.imagen;
        img.alt = cartaData.categoria || "Carta";
        img.addEventListener("click", function(e) {
            e.stopPropagation();
            if (window.mostrarZoom) window.mostrarZoom(cartaData);
        });
        imgWrapper.appendChild(img);
        contenedorCarta.appendChild(imgWrapper);
        
        var categoriaDiv = document.createElement("div");
        categoriaDiv.className = "carta-categoria";
        categoriaDiv.textContent = display.categoriaTexto;
        contenedorCarta.appendChild(categoriaDiv);
        
        var btnCompletar = document.createElement("button");
        btnCompletar.textContent = "Completar";
        btnCompletar.className = "btn-completar";
        btnCompletar.addEventListener("click", function() { completarCarta(celdaId, cartaData); });
        celdaDiv.appendChild(btnCompletar);
        celdaDiv.classList.add("ocupada");
        
        if (!estado.cartasVisibles) {
            img.classList.add("oculta-tablero");
        } else {
            img.classList.remove("oculta-tablero");
        }
    } else {
        celdaDiv.classList.remove("ocupada");
        var categoriaNombre = celdaDiv.querySelector(".categoria-nombre")?.textContent || "";
        var fueCompletada = estado.cartasCompletadas.some(
            function(c) { return c.categoria === categoriaNombre; }
        );
        if (fueCompletada) {
            var checkMark = document.createElement("div");
            checkMark.className = "carta-completada-check";
            checkMark.textContent = "Completada";
            checkMark.style.cssText = "color: #3ca081; text-align: center; font-weight: bold; font-size: 0.9em; margin-top: 5px;";
            contenedorCarta.appendChild(checkMark);
            celdaDiv.classList.add("completada");
        }
    }
}

function crearTablero() {
    var contenedor = document.getElementById("tableroContainer");
    if (!contenedor) return;
    
    contenedor.innerHTML = "";
    
    var equipos = ['A', 'B'];
    equipos.forEach(function(equipo) {
        var equipoCard = document.createElement("div");
        equipoCard.className = "equipo-card";
        equipoCard.innerHTML = '<div class="equipo-titulo">Equipo ' + equipo + '</div><div class="categorias-grid"></div>';
        
        var categoriasGrid = equipoCard.querySelector(".categorias-grid");
        var categoriasEquipo = window.getCeldasEquipo(equipo);
        
        categoriasEquipo.forEach(function(cat) {
            var celdaDiv = document.createElement("div");
            celdaDiv.className = "celda-juego";
            celdaDiv.setAttribute("data-celda-id", cat.id);
            celdaDiv.innerHTML = 
                '<div class="categoria-nombre">' + cat.nombre + '</div>' +
                '<div class="carta-contenido"></div>';
            categoriasGrid.appendChild(celdaDiv);
        });
        contenedor.appendChild(equipoCard);
    });
    
    var estado = window.estadoJuego;
    for (var i = 0; i < estado.tableroCeldas.length; i++) {
        if (estado.tableroCeldas[i] !== null) {
            actualizarCeldaVisual(i, estado.tableroCeldas[i]);
        }
    }
}

function mostrarCartasNormalesIniciales() {
    var estado = window.estadoJuego;
    
    if (estado.opcionesVisibles.length > 0) {
        window.mostrarOpciones();
        window.actualizarContadores();
        return;
    }
    
    if (estado.mazoNormal.length < 6 && estado.mazoNormal.length > 0) {
        estado.opcionesVisibles = estado.mazoNormal.slice();
        estado.mazoNormal = [];
    } else if (estado.mazoNormal.length >= 6) {
        var nuevasCartas = estado.mazoNormal.splice(0, 6);
        estado.opcionesVisibles = nuevasCartas;
    } else {
        estado.mazoNormal = window.mezclarCartas(window.generarMazoNormal());
        var nuevasCartas2 = estado.mazoNormal.splice(0, 6);
        estado.opcionesVisibles = nuevasCartas2;
    }
    
    estado.esperandoIniciarRonda = false;
    window.actualizarContadores();
    window.mostrarOpciones();
}

function nuevaRonda(cartaEspecifica, desdeMqtt) {
    if (cartaEspecifica === undefined) cartaEspecifica = null;
    if (desdeMqtt === undefined) desdeMqtt = false;
    
    var estado = window.estadoJuego;
    
    if (estado.intervaloDesafio) {
        clearInterval(estado.intervaloDesafio);
        estado.intervaloDesafio = null;
    }
    if (estado.intervaloTiempo) {
        clearInterval(estado.intervaloTiempo);
        estado.intervaloTiempo = null;
    }
    
    for (var i = 0; i < estado.tableroCeldas.length; i++) {
        if (estado.tableroCeldas[i] !== null) {
            estado.tableroCeldas[i] = null;
        }
    }
    
    if (!desdeMqtt || estado.opcionesVisibles.length === 0) {
        estado.opcionesVisibles = [];
    }
    
    for (var j = 0; j < 6; j++) {
        actualizarCeldaVisual(j, null);
    }
    
    estado.tiempoEquipoA = 0;
    estado.tiempoEquipoB = 0;
    estado.turnoJuego = null;
    estado.tiempoCorriendo = false;
    
    estado.turnoGanadorDesafio = null;
    estado.turnoActual = null;
    estado.turnosCompletados = [];
    estado.rondaTerminada = false;
    
    window.actualizarTemporizadoresUI();
    window.actualizarIndicadorTurnoJuego(null);
    
    estado.rondaDesafio++;
    window.mostrarOpciones();
    window.actualizarContadores();
    
    if (window.actualizarLeaderboard) {
        setTimeout(function() { window.actualizarLeaderboard(); }, 200);
    }
    
    setTimeout(function() {
        if (window.iniciarRondaDesafio) window.iniciarRondaDesafio(cartaEspecifica, desdeMqtt);
    }, 100);
}

// ===== ASIGNAR AL SCOPE GLOBAL =====
window.crearTablero = crearTablero;
window.actualizarCeldaVisual = actualizarCeldaVisual;
window.colocarCartaEnCelda = colocarCartaEnCelda;
window.completarCarta = completarCarta;
window.mostrarCartasNormalesIniciales = mostrarCartasNormalesIniciales;
window.nuevaRonda = nuevaRonda;