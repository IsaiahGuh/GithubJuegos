// js/modulos/desafio.js

// ========== LOGICA DE DESAFIO ==========

var temporizadorIniciadoRemotamente2 = false;

function iniciarRondaDesafio(cartaEspecifica, desdeMqtt) {
    if (cartaEspecifica === undefined) cartaEspecifica = null;
    if (desdeMqtt === undefined) desdeMqtt = false;
    
    var estado = window.estadoJuego;
    
    estado.esperandoIniciarRonda = true;
    
    estado.turnoGanadorDesafio = null;
    estado.turnoActual = null;
    estado.turnosCompletados = [];
    estado.rondaTerminada = false;
    
    for (var i = 0; i < estado.tableroCeldas.length; i++) {
        estado.tableroCeldas[i] = null;
        if (window.actualizarCeldaVisual) {
            window.actualizarCeldaVisual(i, null);
        }
    }
    
    if (estado.mazoDesafio.length === 0 && estado.mazoDesafioDescarte.length > 0) {
        estado.mazoDesafio = window.mezclarCartas(estado.mazoDesafioDescarte.slice());
        estado.mazoDesafioDescarte = [];
    }
    
    if (estado.mazoDesafio.length === 0) {
        estado.mazoDesafio = window.mezclarCartas(window.generarMazoDesafio());
    }
    
    var equipoEmpieza = estado.rondaDesafio % 2 === 1 ? 'A' : 'B';
    estado.turnoDesafio = equipoEmpieza;
    estado.tiempoDesafio = 0;
    estado.desafioActivo = true;
    temporizadorIniciadoRemotamente2 = false;
    
    if (cartaEspecifica) {
        estado.cartaDesafioActual = cartaEspecifica;
        var index = estado.mazoDesafio.findIndex(function(c) { 
            return c.imagen === cartaEspecifica.imagen;
        });
        if (index !== -1) {
            estado.mazoDesafio.splice(index, 1);
        }
    } else {
        estado.cartaDesafioActual = estado.mazoDesafio.pop();
    }
    
    actualizarCartaDesafioUI();
    
    var cronometro = document.getElementById("cronometroDesafio");
    if (cronometro) {
        cronometro.textContent = "00:00";
        cronometro.style.color = "#f5deb2";
    }
    
    var turnoTexto = document.getElementById("turnoDesafioTexto");
    if (turnoTexto) {
        turnoTexto.textContent = "Esperando inicio - Turno: Equipo " + equipoEmpieza;
    }
    
    var btnTiempo = document.getElementById("btnTiempo");
    if (btnTiempo) {
        btnTiempo.disabled = false;
        btnTiempo.textContent = "PRESIONAR";
    }
    
    if (estado.intervaloDesafio) {
        clearInterval(estado.intervaloDesafio);
        estado.intervaloDesafio = null;
    }
    
    var modal = document.getElementById("modalDesafio");
    if (modal) {
        if (window.abrirModal) {
            window.abrirModal(modal);
        } else {
            modal.style.display = "flex";
            document.body.classList.add("modal-open");
        }
    }
    
    if (window.esModoOnline && window.esModoOnline() && !desdeMqtt) {
        var cartasNormales = estado.opcionesVisibles.length > 0 ? 
            estado.opcionesVisibles : 
            estado.mazoNormal.slice(0, 6);
        var mazoNormalRestante = estado.mazoNormal.slice(6);
        
        setTimeout(function() {
            window.enviarAccion('nueva_ronda_desafio', {
                carta: estado.cartaDesafioActual,
                ronda: estado.rondaDesafio,
                cartasNormales: cartasNormales,
                mazoNormalRestante: mazoNormalRestante
            });
        }, 100);
    }
}

function actualizarCartaDesafioUI() {
    var estado = window.estadoJuego;
    var imgCarta = document.getElementById("imgCartaDesafio");
    if (imgCarta && estado.cartaDesafioActual) {
        imgCarta.src = "imagenes/" + estado.cartaDesafioActual.imagen;
    }
}

function presionarBotonTiempo() {
    var estado = window.estadoJuego;
    if (!estado.desafioActivo) return;
    
    var btnTiempo = document.getElementById("btnTiempo");
    
    if (estado.tiempoDesafio === 0) {
        estado.tiempoDesafio = 10;
        actualizarCronometroDesafioUI();
        
        if (btnTiempo) {
            btnTiempo.disabled = false;
            btnTiempo.textContent = "PRESIONAR";
        }
        
        if (window.esModoOnline && window.esModoOnline()) {
            window.enviarAccion('desafio_temporizador_iniciado', {
                turno: estado.turnoDesafio,
                tiempo: 10
            });
        }
        
        if (!estado.intervaloDesafio) {
            estado.intervaloDesafio = setInterval(function() {
                if (estado.tiempoDesafio > 0 && estado.desafioActivo) {
                    estado.tiempoDesafio--;
                    actualizarCronometroDesafioUI();
                    
                    if (estado.tiempoDesafio === 0) {
                        clearInterval(estado.intervaloDesafio);
                        estado.intervaloDesafio = null;
                        if (btnTiempo) {
                            btnTiempo.disabled = true;
                        }
                        terminarDesafio(estado.turnoDesafio);
                    }
                }
            }, 1000);
        }
    } else {
        estado.tiempoDesafio = 10;
        actualizarCronometroDesafioUI();
        
        estado.turnoDesafio = estado.turnoDesafio === 'A' ? 'B' : 'A';
        var turnoTexto = document.getElementById("turnoDesafioTexto");
        if (turnoTexto) {
            turnoTexto.textContent = "Turno: Equipo " + estado.turnoDesafio + " - Presiona antes de 0";
        }
        
        if (btnTiempo) {
            btnTiempo.disabled = false;
            btnTiempo.textContent = "PRESIONAR";
        }
        
        if (window.esModoOnline && window.esModoOnline()) {
            window.enviarAccion('desafio_cambio_turno', {
                turno: estado.turnoDesafio,
                tiempoRestante: 10
            });
        }
    }
}

function sincronizarTemporizadorDesafio(tiempoRestante, turno) {
    var estado = window.estadoJuego;
    if (tiempoRestante !== undefined) {
        estado.tiempoDesafio = tiempoRestante;
        actualizarCronometroDesafioUI();
    }
    
    if (turno) {
        estado.turnoDesafio = turno;
        var turnoTexto = document.getElementById("turnoDesafioTexto");
        if (turnoTexto) {
            turnoTexto.textContent = "Turno: Equipo " + turno + " - Presiona antes de 0";
        }
    }
    
    var btnTiempo = document.getElementById("btnTiempo");
    if (btnTiempo) {
        btnTiempo.disabled = false;
        btnTiempo.textContent = "PRESIONAR";
    }
    
    temporizadorIniciadoRemotamente2 = true;
}

function actualizarCronometroDesafioUI() {
    var estado = window.estadoJuego;
    var segundos = estado.tiempoDesafio;
    var cronometro = document.getElementById("cronometroDesafio");
    if (cronometro) {
        cronometro.textContent = "00:" + segundos.toString().padStart(2, '0');
        
        if (segundos <= 3 && segundos > 0) {
            cronometro.style.color = "#ff9999";
        } else {
            cronometro.style.color = "#f5deb2";
        }
    }
}

function terminarDesafio(perdedor) {
    var estado = window.estadoJuego;
    estado.desafioActivo = false;
    estado.esperandoIniciarRonda = false;
    var ganador = perdedor === 'A' ? 'B' : 'A';
    
    var turnoTexto = document.getElementById("turnoDesafioTexto");
    if (turnoTexto) {
        turnoTexto.textContent = "Equipo " + perdedor + " pierde! Equipo " + ganador + " gana";
    }
    
    var btnTiempo = document.getElementById("btnTiempo");
    if (btnTiempo) {
        btnTiempo.disabled = true;
    }
    
    estado.mazoDesafioDescarte.push(estado.cartaDesafioActual);
    agregarDesafioGanado(ganador, estado.cartaDesafioActual);
    
    if (ganador === 'A') {
        estado.desafiosGanadosA++;
        window.setEquipoData('A', { tiempo: 60 });
        window.setEquipoData('B', { tiempo: 30 });
    } else {
        estado.desafiosGanadosB++;
        window.setEquipoData('A', { tiempo: 30 });
        window.setEquipoData('B', { tiempo: 60 });
    }
    
    estado.turnoGanadorDesafio = ganador;
    estado.turnoActual = null;
    estado.turnosCompletados = [];
    estado.rondaTerminada = false;
    
    window.actualizarTemporizadoresUI();
    window.actualizarMarcador();
    
    estado.turnoJuego = ganador;
    window.actualizarIndicadorTurnoJuego(ganador);
    window.mostrarCartasNormalesIniciales();
    window.actualizarVisibilidadSegunTurno();
    
    if (window.esModoOnline && window.esModoOnline()) {
        window.enviarAccion('desafio_terminado', {
            ganador: ganador,
            perdedor: perdedor,
            carta: estado.cartaDesafioActual,
            tiempoA: estado.tiempoEquipoA,
            tiempoB: estado.tiempoEquipoB,
            turnoJuego: ganador,
            desafiosGanadosA: estado.desafiosGanadosA,
            desafiosGanadosB: estado.desafiosGanadosB,
            cartasCompletadas: estado.cartasCompletadas
        });
        
        setTimeout(function() {
            var statsGanador = window.calcularPuntuacionEquipo ? 
                window.calcularPuntuacionEquipo(ganador) : { total: 0, desafios: 0, cartas: 0 };
            
            window.enviarAccion('actualizar_puntuacion', {
                equipo: ganador,
                puntuacion: statsGanador.total,
                desafios: statsGanador.desafios,
                cartas: statsGanador.cartas
            });
            
            if (window.renderizarLeaderboard) {
                window.renderizarLeaderboard();
            }
        }, 100);
        
        setTimeout(function() { window.syncTiempo(); }, 200);
    }
    
    if (window.actualizarLeaderboard) {
        setTimeout(function() { window.actualizarLeaderboard(); }, 150);
    }
    
    temporizadorIniciadoRemotamente2 = false;
    
    setTimeout(function() {
        window.cerrarModal(document.getElementById("modalDesafio"));
        window.mostrarMensaje("Fin del Desafio", 
            "Equipo " + ganador + " gana el desafio!\n\n" +
            "SOLO el Equipo " + ganador + " puede colocar cartas en el tablero.\n\n" +
            "1. Selecciona una carta del mazo\n" +
            "2. Colocala en una celda vacia\n" +
            "3. Cuando todas las cartas esten colocadas, presiona el boton de turno para completarlas"
        );
    }, 1500);
}

function terminarDesafioRemoto(perdedor, ganador, data) {
    if (ganador === undefined) ganador = null;
    if (data === undefined) data = null;
    
    var estado = window.estadoJuego;
    
    if (!ganador) {
        ganador = perdedor === 'A' ? 'B' : 'A';
    }
    
    if (estado.intervaloDesafio) {
        clearInterval(estado.intervaloDesafio);
        estado.intervaloDesafio = null;
    }
    
    estado.desafioActivo = false;
    estado.esperandoIniciarRonda = false;
    
    var turnoTexto = document.getElementById("turnoDesafioTexto");
    if (turnoTexto) {
        turnoTexto.textContent = "Equipo " + perdedor + " pierde! Equipo " + ganador + " gana";
    }
    
    var btnTiempo = document.getElementById("btnTiempo");
    if (btnTiempo) {
        btnTiempo.disabled = true;
    }
    
    if (data) {
        if (data.desafiosGanadosA !== undefined) estado.desafiosGanadosA = data.desafiosGanadosA;
        if (data.desafiosGanadosB !== undefined) estado.desafiosGanadosB = data.desafiosGanadosB;
        if (data.cartasCompletadas !== undefined) estado.cartasCompletadas = data.cartasCompletadas;
        if (data.tiempoA !== undefined) estado.tiempoEquipoA = data.tiempoA;
        if (data.tiempoB !== undefined) estado.tiempoEquipoB = data.tiempoB;
    } else {
        estado.mazoDesafioDescarte.push(estado.cartaDesafioActual);
        agregarDesafioGanado(ganador, estado.cartaDesafioActual);
        
        if (ganador === 'A') {
            estado.desafiosGanadosA++;
            window.setEquipoData('A', { tiempo: 60 });
            window.setEquipoData('B', { tiempo: 30 });
        } else {
            estado.desafiosGanadosB++;
            window.setEquipoData('A', { tiempo: 30 });
            window.setEquipoData('B', { tiempo: 60 });
        }
    }
    
    estado.turnoGanadorDesafio = ganador;
    estado.turnoActual = null;
    estado.turnosCompletados = [];
    estado.rondaTerminada = false;
    
    window.actualizarTemporizadoresUI();
    window.actualizarMarcador();
    
    estado.turnoJuego = ganador;
    window.actualizarIndicadorTurnoJuego(ganador);
    window.actualizarVisibilidadSegunTurno();
    window.mostrarCartasNormalesIniciales();
    temporizadorIniciadoRemotamente2 = false;
    
    if (window.actualizarLeaderboard) {
        setTimeout(function() { window.actualizarLeaderboard(); }, 150);
    }
    
    setTimeout(function() {
        window.cerrarModal(document.getElementById("modalDesafio"));
        window.mostrarMensaje("Fin del Desafio", 
            "Equipo " + ganador + " gana el desafio!\n\n" +
            "SOLO el Equipo " + ganador + " puede colocar cartas en el tablero.\n\n" +
            "1. Selecciona una carta del mazo\n" +
            "2. Colocala en una celda vacia\n" +
            "3. Cuando todas las cartas esten colocadas, presiona el boton de turno para completarlas"
        );
    }, 1500);
}

function agregarDesafioGanado(equipo, cartaDesafio) {
    var estado = window.estadoJuego;
    estado.desafiosGanadosLista.push({
        equipo: equipo,
        imagen: cartaDesafio.imagen,
        texto: cartaDesafio.texto,
        fecha: new Date().toLocaleTimeString()
    });
}

// ===== ASIGNAR AL SCOPE GLOBAL =====
window.iniciarRondaDesafio = iniciarRondaDesafio;
window.presionarBotonTiempo = presionarBotonTiempo;
window.sincronizarTemporizadorDesafio = sincronizarTemporizadorDesafio;
window.terminarDesafioRemoto = terminarDesafioRemoto;