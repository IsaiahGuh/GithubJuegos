// js/modulos/tiempos.js

// ========== GESTION DE TIEMPOS DE JUEGO ==========

var temporizadorIniciadoRemotamente = false;

function iniciarTemporizadorJuego(equipo) {
    var estado = window.estadoJuego;
    
    if (estado.intervaloTiempo) {
        return;
    }
    
    if (estado.rondaTerminada) {
        window.mostrarMensaje("Ronda Terminada", "Esta ronda ya ha terminado. Inicia una nueva ronda.");
        return;
    }
    
    if (estado.turnosCompletados.includes(equipo)) {
        window.mostrarMensaje("Turno Completado", "El Equipo " + equipo + " ya jugo en esta ronda.");
        return;
    }
    
    if (estado.turnoGanadorDesafio) {
        if (!estado.turnosCompletados.includes(estado.turnoGanadorDesafio)) {
            if (equipo !== estado.turnoGanadorDesafio) {
                window.mostrarMensaje("Orden de Turnos", 
                    "El Equipo " + estado.turnoGanadorDesafio + " (ganador del desafio) debe jugar primero."
                );
                return;
            }
        }
    }
    
    var tiempoEquipo = equipo === 'A' ? estado.tiempoEquipoA : estado.tiempoEquipoB;
    if (tiempoEquipo <= 0) {
        window.mostrarMensaje("Sin Tiempo", "El Equipo " + equipo + " no tiene tiempo disponible.");
        return;
    }
    
    if (estado.intervaloTiempo) {
        clearInterval(estado.intervaloTiempo);
        estado.intervaloTiempo = null;
    }
    
    estado.turnoJuego = equipo;
    estado.tiempoCorriendo = true;
    temporizadorIniciadoRemotamente = false;
    
    window.actualizarIndicadorTurnoJuego(equipo);
    window.actualizarVisibilidadSegunTurno();
    
    if (window.esModoOnline && window.esModoOnline() && !temporizadorIniciadoRemotamente) {
        window.enviarAccion('iniciar_turno', { equipo: equipo });
        setTimeout(function() { window.syncTiempo(); }, 100);
    }
    
    estado.intervaloTiempo = setInterval(function() {
        if (estado.turnoJuego !== equipo) {
            clearInterval(estado.intervaloTiempo);
            estado.intervaloTiempo = null;
            estado.tiempoCorriendo = false;
            return;
        }
        
        if (equipo === 'A' && estado.tiempoCorriendo) {
            if (estado.tiempoEquipoA > 0) {
                estado.tiempoEquipoA--;
                window.actualizarTemporizadoresUI();
                
                if (window.esModoOnline && window.esModoOnline()) {
                    window.syncTiempo();
                }
                
                if (estado.tiempoEquipoA === 0) {
                    clearInterval(estado.intervaloTiempo);
                    estado.intervaloTiempo = null;
                    estado.tiempoCorriendo = false;
                    
                    if (!estado.turnosCompletados.includes('A')) {
                        estado.turnosCompletados.push('A');
                    }
                    
                    window.mostrarMensaje("Tiempo Agotado", "Tiempo del Equipo A terminado!");
                    window.actualizarIndicadorTurnoJuego(null);
                    
                    if (window.esModoOnline && window.esModoOnline()) {
                        window.enviarAccion('terminar_turno', { equipo: 'A' });
                        window.syncTiempo();
                    }
                    
                    window.verificarFinRondaYVisibilidad();
                }
            }
        } else if (equipo === 'B' && estado.tiempoCorriendo) {
            if (estado.tiempoEquipoB > 0) {
                estado.tiempoEquipoB--;
                window.actualizarTemporizadoresUI();
                
                if (window.esModoOnline && window.esModoOnline()) {
                    window.syncTiempo();
                }
                
                if (estado.tiempoEquipoB === 0) {
                    clearInterval(estado.intervaloTiempo);
                    estado.intervaloTiempo = null;
                    estado.tiempoCorriendo = false;
                    
                    if (!estado.turnosCompletados.includes('B')) {
                        estado.turnosCompletados.push('B');
                    }
                    
                    window.mostrarMensaje("Tiempo Agotado", "Tiempo del Equipo B terminado!");
                    window.actualizarIndicadorTurnoJuego(null);
                    
                    if (window.esModoOnline && window.esModoOnline()) {
                        window.enviarAccion('terminar_turno', { equipo: 'B' });
                        window.syncTiempo();
                    }
                    
                    window.verificarFinRondaYVisibilidad();
                }
            }
        }
    }, 1000);
}

function iniciarTemporizadorJuegoRemoto(equipo) {
    temporizadorIniciadoRemotamente = true;
    iniciarTemporizadorJuego(equipo);
}

function detenerTemporizadorJuego() {
    var estado = window.estadoJuego;
    if (estado.intervaloTiempo) {
        clearInterval(estado.intervaloTiempo);
        estado.intervaloTiempo = null;
    }
    estado.tiempoCorriendo = false;
    
    if (window.esModoOnline && window.esModoOnline() && !temporizadorIniciadoRemotamente) {
        window.enviarAccion('terminar_turno', { equipo: estado.turnoJuego });
        window.syncTiempo();
    }
}

function detenerTemporizadorJuegoRemoto() {
    detenerTemporizadorJuego();
}

function agregarTiempo(segundos) {
    var estado = window.estadoJuego;
    if (estado.turnoJuego === 'A' && estado.tiempoCorriendo) {
        estado.tiempoEquipoA += segundos;
    } else if (estado.turnoJuego === 'B' && estado.tiempoCorriendo) {
        estado.tiempoEquipoB += segundos;
    }
    window.actualizarTemporizadoresUI();
    
    if (window.esModoOnline && window.esModoOnline()) {
        window.syncTiempo();
    }
}

function reiniciarTiemposRonda() {
    var estado = window.estadoJuego;
    estado.tiempoEquipoA = 0;
    estado.tiempoEquipoB = 0;
    estado.rondaTerminada = true;
    estado.turnoJuego = null;
    window.actualizarTemporizadoresUI();
    detenerTemporizadorJuego();
    window.actualizarIndicadorTurnoJuego(null);
    
    if (window.esModoOnline && window.esModoOnline()) {
        window.syncTiempo();
    }
}

function puedeIniciarTurno(equipo) {
    var estado = window.estadoJuego;
    
    if (estado.rondaTerminada) {
        window.mostrarMensaje("Ronda Terminada", "Esta ronda ya ha terminado. Inicia una nueva ronda.");
        return false;
    }
    
    if (estado.turnosCompletados.includes(equipo)) {
        window.mostrarMensaje("Turno Completado", "El Equipo " + equipo + " ya jugo en esta ronda.");
        return false;
    }
    
    if (estado.tiempoCorriendo) {
        window.mostrarMensaje("Turno en Curso", "Ya hay un turno en curso. Espera a que termine.");
        return false;
    }
    
    if (!estado.turnoGanadorDesafio) {
        window.mostrarMensaje("Error", "No hay ganador de desafio. Inicia una nueva ronda.");
        return false;
    }
    
    if (equipo === estado.turnoGanadorDesafio) {
        return true;
    }
    
    if (estado.turnoGanadorDesafio && equipo !== estado.turnoGanadorDesafio) {
        if (estado.turnosCompletados.includes(estado.turnoGanadorDesafio)) {
            return true;
        } else {
            window.mostrarMensaje("Orden de Turnos", 
                "El Equipo " + estado.turnoGanadorDesafio + " (ganador del desafio) debe jugar primero."
            );
            return false;
        }
    }
    
    return false;
}

function verificarFinRondaYVisibilidad() {
    var estado = window.estadoJuego;
    var turnosCompletados = estado.turnosCompletados.length;
    
    if (turnosCompletados >= 2) {
        estado.rondaTerminada = true;
        estado.turnoJuego = null;
        window.mostrarMensaje("Ronda Completada", 
            "Ambos equipos han jugado sus turnos.\n\nPresiona 'Nueva Ronda' para continuar."
        );
        window.actualizarVisibilidadSegunTurno();
        
        if (window.esModoOnline && window.esModoOnline()) {
            window.syncTiempo();
        }
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
            estado.turnoJuego = null;
            var mensaje = "El Equipo " + equipoQueJugo + " ha completado TODAS las cartas que podia!\n\nRonda finalizada.\nPresiona 'Nueva Ronda' para continuar.";
            window.mostrarMensaje("Ronda Completada", mensaje);
            window.actualizarVisibilidadSegunTurno();
            
            if (window.esModoOnline && window.esModoOnline()) {
                window.enviarAccion('ronda_terminada', { 
                    equipo: equipoQueJugo,
                    turnosCompletados: estado.turnosCompletados 
                });
                window.syncTiempo();
            }
            
            if (window.verificarVictoria) {
                window.verificarVictoria(equipoQueJugo);
            }
        } else {
            estado.turnoJuego = equipoQueFalta;
            window.actualizarVisibilidadSegunTurno();
            
            window.mostrarMensaje("Turno del Equipo " + equipoQueFalta, 
                "Ahora es el turno del Equipo " + equipoQueFalta + ".\n\nPresiona el boton 'Turno Equipo " + equipoQueFalta + "' para comenzar."
            );
            
            if (window.esModoOnline && window.esModoOnline()) {
                window.enviarAccion('cambio_turno_automatico', { 
                    equipo: equipoQueFalta,
                    turnosCompletados: estado.turnosCompletados 
                });
                window.syncTiempo();
            }
        }
    }
}

// ===== ASIGNAR AL SCOPE GLOBAL =====
window.iniciarTemporizadorJuego = iniciarTemporizadorJuego;
window.iniciarTemporizadorJuegoRemoto = iniciarTemporizadorJuegoRemoto;
window.detenerTemporizadorJuego = detenerTemporizadorJuego;
window.detenerTemporizadorJuegoRemoto = detenerTemporizadorJuegoRemoto;
window.agregarTiempo = agregarTiempo;
window.reiniciarTiemposRonda = reiniciarTiemposRonda;
window.puedeIniciarTurno = puedeIniciarTurno;
window.verificarFinRondaYVisibilidad = verificarFinRondaYVisibilidad;
window.syncTiempo = window.syncTiempo;