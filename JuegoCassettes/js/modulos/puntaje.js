// js/modulos/puntaje.js

// ========== LOGICA DE PUNTAJE Y CANJE ==========

function calcularPuntuacionEquipo(equipo) {
    var estado = window.estadoJuego;
    var desafios = 0;
    if (equipo === 'A') {
        desafios = estado.desafiosGanadosA || 0;
    } else {
        desafios = estado.desafiosGanadosB || 0;
    }
    
    var cartas = estado.cartasCompletadas.filter(function(c) { return c.equipo === equipo; }).length;
    
    return {
        desafios: desafios,
        cartas: cartas,
        total: desafios + cartas
    };
}

function getEstadisticasEquipo(equipo) {
    var data = window.getEquipoData(equipo);
    var stats = calcularPuntuacionEquipo(equipo);
    
    return Object.assign({}, stats, {
        categorias: data.categorias || [],
        extras: data.extras || {}
    });
}

function verificarVictoria(equipo) {
    var data = window.getEquipoData(equipo);
    var categorias = data.categorias;
    
    var peliculasCount = categorias.filter(function(c) { return c.tipo === 'peliculas'; }).length;
    var seriesCount = categorias.filter(function(c) { return c.tipo === 'series'; }).length;
    var musicaCount = categorias.filter(function(c) { return c.tipo === 'musica'; }).length;
    
    if (peliculasCount >= 3 && seriesCount >= 3 && musicaCount >= 3) {
        window.mostrarMensaje("VICTORIA", "EQUIPO " + equipo + " HA GANADO EL JUEGO!");
        
        if (window.esModoOnline && window.esModoOnline()) {
            window.enviarAccion('victoria', { equipo: equipo });
        }
        
        if (window.actualizarLeaderboard) {
            setTimeout(function() { window.actualizarLeaderboard(); }, 500);
        }
        
        return true;
    }
    return false;
}

function verificarCompletarTodoYDetenerTiempo(equipo) {
    var estado = window.estadoJuego;
    
    var todasLasCeldas = window.getCeldasInfo();
    var celdasEquipo = window.getCeldasEquipo(equipo);
    
    var esGanador = estado.turnoGanadorDesafio === equipo;
    var todasCompletadas = false;
    
    var celdasOcupadas = 0;
    todasLasCeldas.forEach(function(celda) {
        if (estado.tableroCeldas[celda.id] !== null) {
            celdasOcupadas++;
        }
    });
    
    if (esGanador) {
        todasCompletadas = celdasOcupadas === 0;
    } else {
        var celdasEquipoOcupadas = 0;
        celdasEquipo.forEach(function(celda) {
            if (estado.tableroCeldas[celda.id] !== null) {
                celdasEquipoOcupadas++;
            }
        });
        todasCompletadas = celdasEquipoOcupadas === 0;
    }
    
    if (todasCompletadas && estado.tiempoCorriendo && estado.turnoJuego === equipo) {
        window.detenerTemporizadorJuego();
        
        if (!estado.turnosCompletados.includes(equipo)) {
            estado.turnosCompletados.push(equipo);
        }
        
        estado.rondaTerminada = true;
        window.reiniciarTiemposRonda();
        
        if (window.esModoOnline && window.esModoOnline()) {
            window.enviarAccion('ronda_terminada', { 
                equipo: equipo,
                turnosCompletados: estado.turnosCompletados 
            });
        }
        
        var mensaje = "El Equipo " + equipo + " ha completado TODAS las cartas que podia!\n\nRonda finalizada.\nPresiona 'Nueva Ronda' para continuar.";
        window.mostrarMensaje("Ronda Completada", mensaje);
        
        verificarVictoria(equipo);
        
        if (window.actualizarLeaderboard) {
            setTimeout(function() { window.actualizarLeaderboard(); }, 200);
        }
        
        return true;
    }
    
    return false;
}

function realizarCanje(equipo, categoriaOrigen, tipoOrigen, categoriaDestino, tipoDestino) {
    var key = tipoOrigen + "_" + categoriaOrigen;
    var data = window.getEquipoData(equipo);
    var extras = data.extras;
    
    if (extras[key] >= 3) {
        extras[key] -= 3;
        if (extras[key] === 0) {
            delete extras[key];
        }
        
        var nuevasCategorias = data.categorias.slice();
        nuevasCategorias.push({
            tipo: tipoDestino,
            categoria: categoriaDestino
        });
        
        window.setEquipoData(equipo, {
            categorias: nuevasCategorias,
            extras: extras
        });
        
        window.actualizarMarcador();
        
        if (window.esModoOnline && window.esModoOnline()) {
            window.enviarAccion('canje_realizado', {
                equipo: equipo,
                categoriaOrigen: categoriaOrigen,
                tipoOrigen: tipoOrigen,
                categoriaDestino: categoriaDestino,
                tipoDestino: tipoDestino
            });
        }
        
        window.cerrarModal(document.getElementById("modalCanje"));
        verificarVictoria(equipo);
        window.mostrarMensaje("Canje Exitoso", "Nueva categoria: " + categoriaDestino + " (" + tipoDestino + ")");
        
        if (window.actualizarLeaderboard) {
            setTimeout(function() { window.actualizarLeaderboard(); }, 200);
        }
    } else {
        window.mostrarMensaje("Error", "No tienes suficientes extras para canjear");
    }
}

function verificarFinRondaYVisibilidad() {
    var estado = window.estadoJuego;
    var turnosCompletados = estado.turnosCompletados.length;
    
    if (turnosCompletados >= 2) {
        estado.rondaTerminada = true;
        window.mostrarMensaje("Ronda Completada", 
            "Ambos equipos han jugado sus turnos.\n\nPresiona 'Nueva Ronda' para continuar."
        );
        window.actualizarVisibilidadSegunTurno();
        return;
    }
    
    if (turnosCompletados === 1) {
        var equipoQueJugo = estado.turnosCompletados[0];
        var equipoQueFalta = equipoQueJugo === 'A' ? 'B' : 'A';
        
        var esGanador = estado.turnoGanadorDesafio === equipoQueJugo;
        var todasCompletadas = false;
        
        var todasLasCeldas = window.getCeldasInfo();
        var celdasOcupadas = 0;
        todasLasCeldas.forEach(function(celda) {
            if (estado.tableroCeldas[celda.id] !== null) {
                celdasOcupadas++;
            }
        });
        
        if (esGanador) {
            todasCompletadas = celdasOcupadas === 0;
        } else {
            var celdasEquipo = window.getCeldasEquipo(equipoQueJugo);
            var celdasEquipoOcupadas = 0;
            celdasEquipo.forEach(function(celda) {
                if (estado.tableroCeldas[celda.id] !== null) {
                    celdasEquipoOcupadas++;
                }
            });
            todasCompletadas = celdasEquipoOcupadas === 0;
        }
        
        if (todasCompletadas) {
            estado.rondaTerminada = true;
            var mensaje = "El Equipo " + equipoQueJugo + " ha completado TODAS las cartas que podia!\n\nRonda finalizada.\nPresiona 'Nueva Ronda' para continuar.";
            window.mostrarMensaje("Ronda Completada", mensaje);
            window.actualizarVisibilidadSegunTurno();
        } else {
            estado.turnoJuego = equipoQueFalta;
            window.actualizarVisibilidadSegunTurno();
            
            window.mostrarMensaje("Turno del Equipo " + equipoQueFalta, 
                "Ahora es el turno del Equipo " + equipoQueFalta + ".\n\nPresiona el boton 'Turno Equipo " + equipoQueFalta + "' para comenzar."
            );
            
            if (window.esModoOnline && window.esModoOnline()) {
                if (window.syncTiempo) {
                    window.syncTiempo();
                }
            }
        }
    }
}

// ===== ASIGNAR AL SCOPE GLOBAL =====
window.calcularPuntuacionEquipo = calcularPuntuacionEquipo;
window.getEstadisticasEquipo = getEstadisticasEquipo;
window.verificarVictoria = verificarVictoria;
window.verificarCompletarTodoYDetenerTiempo = verificarCompletarTodoYDetenerTiempo;
window.realizarCanje = realizarCanje;
window.verificarFinRondaYVisibilidad = verificarFinRondaYVisibilidad;