// js/mqtt/mqtt.js
// ========== CLIENTE MQTT ==========

var mqttClient = null;
var salaActual = null;
var jugadoresConectados = {};
var claimResolved = false;
var pendingClaim = null;

// ===== SINCRONIZACION DE ESTADO AL UNIRSE/RECONECTAR =====
var estadoSincronizado = false;       // true una vez que este cliente aplico un snapshot recibido
var estadoListoParaCompartir = false; // true cuando este cliente ya tiene un estado confiable para compartir con otros

window.estadoJugador = {
    id: null,
    nombre: 'Jugador',
    equipo: 'A',
    sala: null,
    conectado: false
};

// ========== CONEXION ==========
function conectarSala(codigo, nombre, equipo, isReconnect) {
    if (isReconnect === undefined) isReconnect = false;
    
    window.estadoJugador.id = window.estadoJugador.id || Math.random().toString(36).substr(2, 9);
    window.estadoJugador.nombre = nombre;
    window.estadoJugador.equipo = equipo;
    window.estadoJugador.sala = codigo;
    window.estadoJugador.conectado = true;
    salaActual = codigo;
    claimResolved = isReconnect;
    pendingClaim = null;
    
    // Al (re)conectar todavia no sabemos si nuestro estado local es confiable
    // (inicializarJuego() lo dejo "vacio"), asi que esperamos antes de poder
    // servir de fuente de estado a otros que se unan despues que nosotros.
    estadoSincronizado = false;
    estadoListoParaCompartir = false;
    setTimeout(function() { estadoListoParaCompartir = true; }, 1500);
    
    if (window.showLoading) window.showLoading(isReconnect ? 'Reconectando...' : 'Conectando...');

    mqttClient = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

    mqttClient.on('connect', function() {
        var topic = 'cassettes/room/' + codigo;
        mqttClient.subscribe(topic);
        
        if (window.hideLoading) window.hideLoading();
        enviarAccion('join');
        
        if (window.saveSession) window.saveSession();
        if (window.mostrarInfoSala) window.mostrarInfoSala(codigo);
    });

    mqttClient.on('message', function(topic, message) {
        try {
            var data = JSON.parse(message.toString());
            if (data.id === window.estadoJugador.id) return;
            procesarMensaje(data);
        } catch(e) { 
            console.error('Mensaje invalido', e); 
        }
    });

    mqttClient.on('error', function(err) {
        if (window.hideLoading) window.hideLoading();
        if (window.mostrarMensaje) window.mostrarMensaje('Error', 'No se pudo conectar');
        window.estadoJugador.conectado = false;
    });
}

// ========== ENVIO ==========
function enviarAccion(tipo, datos) {
    if (datos === undefined) datos = {};
    if (!mqttClient || !salaActual) return;
    
    var payload = {
        action: tipo,
        id: window.estadoJugador.id,
        nombre: window.estadoJugador.nombre,
        equipo: window.estadoJugador.equipo,
        datos: datos,
        timestamp: Date.now()
    };
    
    mqttClient.publish('cassettes/room/' + salaActual, JSON.stringify(payload));
}

// ========== SINCRONIZAR TIEMPO ==========
function syncTiempo() {
    if (!mqttClient || !salaActual) return;
    
    var estado = window.estadoJuego || {};
    enviarAccion('sync_tiempo', {
        tiempoA: estado.tiempoEquipoA,
        tiempoB: estado.tiempoEquipoB,
        turnoJuego: estado.turnoJuego,
        tiempoCorriendo: estado.tiempoCorriendo
    });
}

// ========== SNAPSHOT DE ESTADO (para sync al unirse/reconectar) ==========
function construirSnapshotEstado() {
    var estado = window.estadoJuego || {};
    var vis = window.estadoVisibilidad || {};
    
    return {
        mazoDesafio: estado.mazoDesafio,
        mazoDesafioDescarte: estado.mazoDesafioDescarte,
        mazoNormal: estado.mazoNormal,
        cartaDesafioActual: estado.cartaDesafioActual,
        
        tiempoDesafio: estado.tiempoDesafio,
        turnoDesafio: estado.turnoDesafio,
        rondaDesafio: estado.rondaDesafio,
        desafioActivo: estado.desafioActivo,
        
        opcionesVisibles: estado.opcionesVisibles,
        tableroCeldas: estado.tableroCeldas,
        
        tiempoEquipoA: estado.tiempoEquipoA,
        tiempoEquipoB: estado.tiempoEquipoB,
        turnoJuego: estado.turnoJuego,
        tiempoCorriendo: estado.tiempoCorriendo,
        
        turnoGanadorDesafio: estado.turnoGanadorDesafio,
        turnoActual: estado.turnoActual,
        turnosCompletados: estado.turnosCompletados,
        rondaTerminada: estado.rondaTerminada,
        
        desafiosGanadosA: estado.desafiosGanadosA,
        desafiosGanadosB: estado.desafiosGanadosB,
        cartasCompletadas: estado.cartasCompletadas,
        desafiosGanadosLista: estado.desafiosGanadosLista,
        
        categoriasCompletadasA: estado.categoriasCompletadasA,
        categoriasCompletadasB: estado.categoriasCompletadasB,
        extrasA: estado.extrasA,
        extrasB: estado.extrasB,
        
        juegoIniciado: estado.juegoIniciado,
        esperandoIniciarRonda: estado.esperandoIniciarRonda,
        cartasVisibles: estado.cartasVisibles,
        
        equipoConVisibilidad: vis.equipoConVisibilidad,
        forzarOculto: vis.forzarOculto,
        
        jugadoresConectados: jugadoresConectados
    };
}

function enviarEstadoA(targetId) {
    var snapshot = construirSnapshotEstado();
    snapshot.targetId = targetId;
    enviarAccion('estado_snapshot', snapshot);
}

function aplicarSnapshotEstado(snap) {
    var estado = window.estadoJuego;
    if (!estado) return;
    
    var campos = [
        'mazoDesafio', 'mazoDesafioDescarte', 'mazoNormal', 'cartaDesafioActual',
        'tiempoDesafio', 'turnoDesafio', 'rondaDesafio', 'desafioActivo',
        'opcionesVisibles', 'tableroCeldas',
        'tiempoEquipoA', 'tiempoEquipoB', 'turnoJuego', 'tiempoCorriendo',
        'turnoGanadorDesafio', 'turnoActual', 'turnosCompletados', 'rondaTerminada',
        'desafiosGanadosA', 'desafiosGanadosB', 'cartasCompletadas', 'desafiosGanadosLista',
        'categoriasCompletadasA', 'categoriasCompletadasB', 'extrasA', 'extrasB',
        'juegoIniciado', 'esperandoIniciarRonda', 'cartasVisibles'
    ];
    
    campos.forEach(function(campo) {
        if (snap[campo] !== undefined) estado[campo] = snap[campo];
    });
    
    if (window.estadoVisibilidad) {
        if (snap.equipoConVisibilidad !== undefined) window.estadoVisibilidad.equipoConVisibilidad = snap.equipoConVisibilidad;
        if (snap.forzarOculto !== undefined) window.estadoVisibilidad.forzarOculto = snap.forzarOculto;
    }
    
    if (snap.jugadoresConectados) {
        Object.keys(snap.jugadoresConectados).forEach(function(id) {
            if (id !== window.estadoJugador.id) {
                jugadoresConectados[id] = snap.jugadoresConectados[id];
            }
        });
        window.jugadoresConectados = jugadoresConectados;
    }
    
    // ===== REPINTAR TODA LA UI CON EL ESTADO RECIBIDO =====
    if (window.crearTablero) window.crearTablero();
    if (window.actualizarContadores) window.actualizarContadores();
    if (window.mostrarOpciones) window.mostrarOpciones();
    if (window.actualizarTemporizadoresUI) window.actualizarTemporizadoresUI();
    if (window.actualizarMarcador) window.actualizarMarcador();
    if (window.actualizarIndicadorTurnoJuego) window.actualizarIndicadorTurnoJuego(estado.turnoJuego);
    if (window.actualizarVisibilidadSegunTurno) window.actualizarVisibilidadSegunTurno();
    if (window.actualizarLeaderboard) window.actualizarLeaderboard();
    if (window.hideLoading) window.hideLoading();
    
    // ===== SI HABIA UN DESAFIO EN CURSO, REABRIR MODAL Y REANUDAR CRONOMETRO =====
    if (estado.desafioActivo) {
        if (window.abrirModal) {
            window.abrirModal(document.getElementById('modalDesafio'));
        }
        var imgCarta = document.getElementById('imgCartaDesafio');
        if (imgCarta && estado.cartaDesafioActual) {
            imgCarta.src = 'imagenes/' + estado.cartaDesafioActual.imagen;
        }
        var cronometro = document.getElementById('cronometroDesafio');
        if (cronometro) {
            cronometro.textContent = '00:' + (estado.tiempoDesafio || 0).toString().padStart(2, '0');
        }
        var turnoTexto = document.getElementById('turnoDesafioTexto');
        if (turnoTexto) {
            turnoTexto.textContent = 'Turno: Equipo ' + estado.turnoDesafio + ' - Presiona antes de 0';
        }
        var btnTiempo = document.getElementById('btnTiempo');
        if (btnTiempo) {
            btnTiempo.disabled = false;
            btnTiempo.textContent = 'PRESIONAR';
        }
        
        if (!estado.intervaloDesafio && estado.tiempoDesafio > 0) {
            estado.intervaloDesafio = setInterval(function() {
                if (estado.tiempoDesafio > 0 && estado.desafioActivo) {
                    estado.tiempoDesafio--;
                    var c = document.getElementById('cronometroDesafio');
                    if (c) {
                        c.textContent = '00:' + estado.tiempoDesafio.toString().padStart(2, '0');
                        c.style.color = (estado.tiempoDesafio <= 3 && estado.tiempoDesafio > 0) ? '#ff9999' : '#f5deb2';
                    }
                    if (estado.tiempoDesafio === 0) {
                        clearInterval(estado.intervaloDesafio);
                        estado.intervaloDesafio = null;
                        var b = document.getElementById('btnTiempo');
                        if (b) b.disabled = true;
                        if (window.terminarDesafioRemoto) window.terminarDesafioRemoto(estado.turnoDesafio);
                    }
                }
            }, 1000);
        }
    }
    
    // ===== SI HAY UN TURNO DE TIEMPO CORRIENDO, REANUDAR EL CONTADOR VISUAL =====
    if (estado.tiempoCorriendo && (estado.turnoJuego === 'A' || estado.turnoJuego === 'B')) {
        var tiempoDisponible = estado.turnoJuego === 'A' ? estado.tiempoEquipoA : estado.tiempoEquipoB;
        if (tiempoDisponible > 0 && window.iniciarTemporizadorJuegoRemoto) {
            window.iniciarTemporizadorJuegoRemoto(estado.turnoJuego);
        }
    }
}

// ========== RECEPCION ==========
function procesarMensaje(data) {
    if (data.id === window.estadoJugador.id) return;
    
    jugadoresConectados[data.id] = {
        nombre: data.nombre,
        equipo: data.equipo,
        conectado: true
    };
    
    window.jugadoresConectados = jugadoresConectados;

    // ===== SISTEMA DE CLAIM (RECLAMACION) =====
    if (data.action === 'claim_offer') {
        if (data.targetId === window.estadoJugador.id && !claimResolved) {
            claimResolved = true;
            pendingClaim = { oldId: data.offeredId, name: data.name, equipo: data.equipo || 'A' };
            showClaimModal(pendingClaim);
        }
        return;
    }

    if (!claimResolved && data.nombre === window.estadoJugador.nombre && data.id !== window.estadoJugador.id) {
        claimResolved = true;
        pendingClaim = { oldId: data.id, name: data.name, equipo: data.equipo || 'A' };
        showClaimModal(pendingClaim);
        return;
    }
    
    switch (data.action) {
        case 'join':
            if (window.actualizarLeaderboard) {
                setTimeout(function() { window.actualizarLeaderboard(); }, 300);
            }
            
            for (var id in jugadoresConectados) {
                if (id !== data.id && jugadoresConectados[id].nombre === data.nombre) {
                    broadcastClaimOffer(data.id, id);
                    break;
                }
            }
            
            if (window.saveRegistryEntry) {
                window.saveRegistryEntry(salaActual, data.nombre, data.id, data.equipo);
            }
            
            // Si nosotros ya tenemos un estado confiable, le mandamos una "foto"
            // completa del juego al que se acaba de unir/reconectar, dirigida
            // solo a el (targetId). Con delay aleatorio para no saturar si hay
            // varios clientes respondiendo al mismo tiempo.
            if (estadoListoParaCompartir) {
                (function(targetId) {
                    setTimeout(function() {
                        if (mqttClient && salaActual) {
                            enviarEstadoA(targetId);
                        }
                    }, 300 + Math.random() * 600);
                })(data.id);
            }
            break;
        
        case 'estado_snapshot':
            if (data.datos && data.datos.targetId === window.estadoJugador.id && !estadoSincronizado) {
                estadoSincronizado = true;
                aplicarSnapshotEstado(data.datos);
            }
            break;
        
        case 'iniciar_turno':
            if (data.datos && data.datos.equipo) {
                var estado = window.estadoJuego || {};
                estado.turnoJuego = data.datos.equipo;
                estado.tiempoCorriendo = true;
                
                if (window.actualizarIndicadorTurnoJuego) {
                    window.actualizarIndicadorTurnoJuego(data.datos.equipo);
                }
                if (window.actualizarVisibilidadSegunTurno) {
                    window.actualizarVisibilidadSegunTurno();
                }
                
                if (window.iniciarTemporizadorJuegoRemoto) {
                    window.iniciarTemporizadorJuegoRemoto(data.datos.equipo);
                }
            }
            break;
        
        case 'terminar_turno':
            if (data.datos && data.datos.equipo) {
                var estado = window.estadoJuego || {};
                if (!estado.turnosCompletados) estado.turnosCompletados = [];
                if (!estado.turnosCompletados.includes(data.datos.equipo)) {
                    estado.turnosCompletados.push(data.datos.equipo);
                }
                estado.tiempoCorriendo = false;
                
                if (window.detenerTemporizadorJuegoRemoto) {
                    window.detenerTemporizadorJuegoRemoto();
                }
                
                if (window.verificarFinRondaYVisibilidad) {
                    setTimeout(function() { window.verificarFinRondaYVisibilidad(); }, 100);
                }
            }
            break;

        case 'sync_tiempo':
            if (data.datos) {
                var estado = window.estadoJuego || {};
                if (data.datos.tiempoA !== undefined) estado.tiempoEquipoA = data.datos.tiempoA;
                if (data.datos.tiempoB !== undefined) estado.tiempoEquipoB = data.datos.tiempoB;
                if (data.datos.turnoJuego !== undefined) estado.turnoJuego = data.datos.turnoJuego;
                if (data.datos.tiempoCorriendo !== undefined) estado.tiempoCorriendo = data.datos.tiempoCorriendo;
                
                if (window.actualizarTemporizadoresUI) window.actualizarTemporizadoresUI();
                if (window.actualizarIndicadorTurnoJuego && data.datos.turnoJuego) {
                    window.actualizarIndicadorTurnoJuego(data.datos.turnoJuego);
                }
            }
            break;

        case 'sync_visibilidad':
            if (data.datos && window.sincronizarVisibilidadRemota) {
                window.sincronizarVisibilidadRemota(data.datos);
            }
            break;
        
        case 'colocar_carta':
            if (data.datos) {
                if (data.datos.celdaId !== undefined && data.datos.carta) {
                    var estado = window.estadoJuego || {};
                    estado.tableroCeldas[data.datos.celdaId] = data.datos.carta;
                    
                    if (window.actualizarCeldaVisual) {
                        window.actualizarCeldaVisual(data.datos.celdaId, data.datos.carta);
                    }
                }
                
                if (data.datos.opcionesVisibles) {
                    var estado = window.estadoJuego || {};
                    estado.opcionesVisibles = data.datos.opcionesVisibles;
                    if (window.mostrarOpciones) window.mostrarOpciones();
                    if (window.actualizarContadores) window.actualizarContadores();
                }
            }
            break;
        
        case 'eliminar_carta_mazo':
            if (data.datos && data.datos.indice !== undefined) {
                var estado = window.estadoJuego || {};
                estado.opcionesVisibles.splice(data.datos.indice, 1);
                if (window.mostrarOpciones) window.mostrarOpciones();
                if (window.actualizarContadores) window.actualizarContadores();
            }
            break;
        
        case 'completar_carta':
            if (data.datos && data.datos.celdaId !== undefined && data.datos.carta) {
                var estado = window.estadoJuego || {};
                estado.tableroCeldas[data.datos.celdaId] = null;
                
                if (data.datos.cartasCompletadas !== undefined) {
                    estado.cartasCompletadas = data.datos.cartasCompletadas;
                }
                if (data.datos.desafiosGanadosA !== undefined) {
                    estado.desafiosGanadosA = data.datos.desafiosGanadosA;
                }
                if (data.datos.desafiosGanadosB !== undefined) {
                    estado.desafiosGanadosB = data.datos.desafiosGanadosB;
                }
                
                if (window.actualizarCeldaVisual) {
                    window.actualizarCeldaVisual(data.datos.celdaId, null);
                }
                if (window.actualizarMarcador) window.actualizarMarcador();
                if (window.actualizarLeaderboard) {
                    setTimeout(function() { window.actualizarLeaderboard(); }, 100);
                }
            }
            break;
        
        case 'desafio_temporizador_iniciado':
            if (data.datos) {
                var estado = window.estadoJuego || {};
                var tiempo = data.datos.tiempo || 10;
                var turno = data.datos.turno || estado.turnoDesafio;
                
                estado.tiempoDesafio = tiempo;
                estado.turnoDesafio = turno;
                
                var cronometro = document.getElementById("cronometroDesafio");
                if (cronometro) {
                    cronometro.textContent = "00:" + tiempo.toString().padStart(2, '0');
                    cronometro.style.color = "#f5deb2";
                }
                
                var turnoTexto = document.getElementById("turnoDesafioTexto");
                if (turnoTexto) {
                    turnoTexto.textContent = "Turno: Equipo " + turno + " - Presiona antes de 0";
                }
                
                var btnTiempo = document.getElementById("btnTiempo");
                if (btnTiempo) {
                    btnTiempo.disabled = false;
                    btnTiempo.textContent = "PRESIONAR";
                }
                
                if (!estado.intervaloDesafio && estado.tiempoDesafio > 0) {
                    estado.intervaloDesafio = setInterval(function() {
                        if (estado.tiempoDesafio > 0 && estado.desafioActivo) {
                            estado.tiempoDesafio--;
                            var cronometroLocal = document.getElementById("cronometroDesafio");
                            if (cronometroLocal) {
                                cronometroLocal.textContent = "00:" + estado.tiempoDesafio.toString().padStart(2, '0');
                                if (estado.tiempoDesafio <= 3 && estado.tiempoDesafio > 0) {
                                    cronometroLocal.style.color = "#ff9999";
                                } else {
                                    cronometroLocal.style.color = "#f5deb2";
                                }
                            }
                            if (estado.tiempoDesafio === 0) {
                                clearInterval(estado.intervaloDesafio);
                                estado.intervaloDesafio = null;
                                var btnLocal = document.getElementById("btnTiempo");
                                if (btnLocal) btnLocal.disabled = true;
                                if (window.terminarDesafioRemoto) {
                                    window.terminarDesafioRemoto(estado.turnoDesafio);
                                }
                            }
                        }
                    }, 1000);
                }
            }
            break;

        case 'desafio_cambio_turno':
            if (data.datos) {
                var estado = window.estadoJuego || {};
                var tiempo = data.datos.tiempoRestante || 10;
                var turno = data.datos.turno || estado.turnoDesafio;
                
                estado.tiempoDesafio = tiempo;
                estado.turnoDesafio = turno;
                
                var cronometro = document.getElementById("cronometroDesafio");
                if (cronometro) {
                    cronometro.textContent = "00:" + tiempo.toString().padStart(2, '0');
                    cronometro.style.color = "#f5deb2";
                }
                
                var turnoTexto = document.getElementById("turnoDesafioTexto");
                if (turnoTexto) {
                    turnoTexto.textContent = "Turno: Equipo " + turno + " - Presiona antes de 0";
                }
                
                var btnTiempo = document.getElementById("btnTiempo");
                if (btnTiempo) {
                    btnTiempo.disabled = false;
                    btnTiempo.textContent = "PRESIONAR";
                }
                
                if (!estado.intervaloDesafio && estado.tiempoDesafio > 0) {
                    estado.intervaloDesafio = setInterval(function() {
                        if (estado.tiempoDesafio > 0 && estado.desafioActivo) {
                            estado.tiempoDesafio--;
                            var cronometroLocal = document.getElementById("cronometroDesafio");
                            if (cronometroLocal) {
                                cronometroLocal.textContent = "00:" + estado.tiempoDesafio.toString().padStart(2, '0');
                                if (estado.tiempoDesafio <= 3 && estado.tiempoDesafio > 0) {
                                    cronometroLocal.style.color = "#ff9999";
                                } else {
                                    cronometroLocal.style.color = "#f5deb2";
                                }
                            }
                            if (estado.tiempoDesafio === 0) {
                                clearInterval(estado.intervaloDesafio);
                                estado.intervaloDesafio = null;
                                var btnLocal = document.getElementById("btnTiempo");
                                if (btnLocal) btnLocal.disabled = true;
                                if (window.terminarDesafioRemoto) {
                                    window.terminarDesafioRemoto(estado.turnoDesafio);
                                }
                            }
                        }
                    }, 1000);
                }
            }
            break;

        case 'desafio_terminado':
            if (data.datos) {
                var estado = window.estadoJuego || {};
                
                if (data.datos.tiempoA !== undefined) estado.tiempoEquipoA = data.datos.tiempoA;
                if (data.datos.tiempoB !== undefined) estado.tiempoEquipoB = data.datos.tiempoB;
                if (data.datos.turnoJuego !== undefined) estado.turnoJuego = data.datos.turnoJuego;
                if (data.datos.desafiosGanadosA !== undefined) estado.desafiosGanadosA = data.datos.desafiosGanadosA;
                if (data.datos.desafiosGanadosB !== undefined) estado.desafiosGanadosB = data.datos.desafiosGanadosB;
                if (data.datos.cartasCompletadas !== undefined) estado.cartasCompletadas = data.datos.cartasCompletadas;
                
                if (window.actualizarTemporizadoresUI) window.actualizarTemporizadoresUI();
                if (window.actualizarMarcador) window.actualizarMarcador();
                if (window.actualizarLeaderboard) {
                    setTimeout(function() { window.actualizarLeaderboard(); }, 100);
                }
                if (window.terminarDesafioRemoto) {
                    window.terminarDesafioRemoto(data.datos?.perdedor, data.datos?.ganador, data.datos);
                }
            }
            break;
            
        case 'nueva_ronda_desafio':
            if (data.datos && data.datos.carta) {
                var estado = window.estadoJuego || {};
                estado.cartaDesafioActual = data.datos.carta;
                estado.rondaDesafio = data.datos.ronda || estado.rondaDesafio;
                
                if (data.datos.cartasNormales && data.datos.mazoNormalRestante !== undefined) {
                    estado.opcionesVisibles = data.datos.cartasNormales;
                    estado.mazoNormal = data.datos.mazoNormalRestante || [];
                    
                    if (window.mostrarOpciones) window.mostrarOpciones();
                    if (window.actualizarContadores) window.actualizarContadores();
                    
                    for (var i = 0; i < estado.tableroCeldas.length; i++) {
                        estado.tableroCeldas[i] = null;
                        if (window.actualizarCeldaVisual) {
                            window.actualizarCeldaVisual(i, null);
                        }
                    }
                }
                
                var modal = document.getElementById("modalDesafio");
                if (modal) {
                    var imgCarta = document.getElementById("imgCartaDesafio");
                    if (imgCarta) {
                        imgCarta.src = "imagenes/" + data.datos.carta.imagen;
                    }
                    
                    var turnoInicial = estado.rondaDesafio % 2 === 1 ? 'A' : 'B';
                    estado.turnoDesafio = turnoInicial;
                    var turnoTexto = document.getElementById("turnoDesafioTexto");
                    if (turnoTexto) {
                        turnoTexto.textContent = "Esperando inicio - Turno: Equipo " + turnoInicial;
                    }
                    
                    var cronometro = document.getElementById("cronometroDesafio");
                    if (cronometro) {
                        cronometro.textContent = "00:00";
                        cronometro.style.color = "#f5deb2";
                    }
                    
                    var btnTiempo = document.getElementById("btnTiempo");
                    if (btnTiempo) {
                        btnTiempo.disabled = false;
                        btnTiempo.textContent = "PRESIONAR";
                    }
                    
                    if (window.abrirModal) {
                        window.abrirModal(modal);
                    } else {
                        modal.style.display = "flex";
                        document.body.classList.add("modal-open");
                    }
                    
                    estado.desafioActivo = true;
                    estado.esperandoIniciarRonda = true;
                }
            }
            break;

        case 'nueva_ronda':
            if (window.nuevaRonda) {
                window.nuevaRonda(data.datos?.carta || null, true);
            }
            break;
        
        case 'ronda_terminada':
            if (data.datos && data.datos.equipo) {
                var estado = window.estadoJuego || {};
                estado.rondaTerminada = true;
                if (window.mostrarMensaje) {
                    window.mostrarMensaje("Ronda Terminada", 
                        "El equipo " + data.datos.equipo + " ha completado la ronda."
                    );
                }
            }
            break;
            
        case 'victoria':
            if (data.datos && data.datos.equipo && window.mostrarMensaje) {
                window.mostrarMensaje("VICTORIA", 
                    "EQUIPO " + data.datos.equipo + " HA GANADO EL JUEGO!"
                );
            }
            break;
        
        case 'actualizar_puntuacion':
            if (window.renderizarLeaderboard) window.renderizarLeaderboard();
            break;
            
        case 'canje_realizado':
            if (window.actualizarLeaderboard) {
                setTimeout(function() { window.actualizarLeaderboard(); }, 300);
            }
            break;
            
        case 'accion':
            if (window.procesarAccionRemota) {
                window.procesarAccionRemota(data.tipo, data.datos, data.equipo);
            }
            break;
            
        case 'leave':
            delete jugadoresConectados[data.id];
            window.jugadoresConectados = jugadoresConectados;
            if (window.actualizarLeaderboard) {
                setTimeout(function() { window.actualizarLeaderboard(); }, 300);
            }
            break;
            
        default:
            break;
    }
}

// ===== CLAIM (RECLAMACION) =====
function broadcastClaimOffer(targetId, offeredId) {
    if (mqttClient && salaActual) {
        var cached = jugadoresConectados[offeredId];
        if (!cached) return;
        var topic = 'cassettes/room/' + salaActual;
        var payload = JSON.stringify({
            action: 'claim_offer',
            targetId: targetId,
            offeredId: offeredId,
            name: cached.nombre,
            equipo: cached.equipo || 'A'
        });
        mqttClient.publish(topic, payload);
    }
}

function broadcastRemove(idToRemove) {
    if (mqttClient && salaActual) {
        var topic = 'cassettes/room/' + salaActual;
        var payload = JSON.stringify({
            action: 'remove',
            id: idToRemove
        });
        mqttClient.publish(topic, payload);
    }
}

function showClaimModal(claim) {
    var modal = document.getElementById('claimModal');
    var text = document.getElementById('claimText');
    if (text) {
        text.textContent = 'Ya hay un jugador "' + claim.name + '" en la sala. ¿Eres tu (te desconectaste antes)?';
    }
    if (modal) modal.style.display = 'flex';
}

function acceptClaim() {
    if (!pendingClaim) return;
    var staleTempId = window.estadoJugador.id;

    broadcastRemove(staleTempId);

    delete jugadoresConectados[staleTempId];
    window.estadoJugador.id = pendingClaim.oldId;
    window.estadoJugador.nombre = pendingClaim.name;
    window.estadoJugador.equipo = pendingClaim.equipo || 'A';
    
    document.getElementById('claimModal').style.display = 'none';
    pendingClaim = null;
    claimResolved = true;
    
    if (window.saveSession) window.saveSession();
    if (window.saveRegistryEntry) {
        window.saveRegistryEntry(salaActual, window.estadoJugador.nombre, window.estadoJugador.id, window.estadoJugador.equipo);
    }
    
    if (window.actualizarLeaderboard) {
        setTimeout(function() { window.actualizarLeaderboard(); }, 300);
    }
}

function declineClaim() {
    pendingClaim = null;
    document.getElementById('claimModal').style.display = 'none';
}

// ===== UTILIDADES =====
function esModoOnline() {
    return salaActual !== null && mqttClient !== null && mqttClient.connected;
}

function desconectarSala() {
    if (mqttClient) {
        enviarAccion('leave');
        mqttClient.end();
        mqttClient = null;
    }
    salaActual = null;
    window.estadoJugador.conectado = false;
}

// ===== ASIGNAR AL SCOPE GLOBAL =====
window.conectarSala = conectarSala;
window.enviarAccion = enviarAccion;
window.esModoOnline = esModoOnline;
window.syncTiempo = syncTiempo;
window.desconectarSala = desconectarSala;
window.acceptClaim = acceptClaim;
window.declineClaim = declineClaim;
window.enviarEstadoA = enviarEstadoA;
window.construirSnapshotEstado = construirSnapshotEstado;
window.aplicarSnapshotEstado = aplicarSnapshotEstado;