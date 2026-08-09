// ============================================================
// PUNTAJES.JS - CLEVERDADOS (CORREGIDO - CON LOBOS SUMADOS AL TOTAL)
// ============================================================

const PUNTAJES = {
    // ============================================================
    // ÁREA AMARILLA
    // SOLO puntos por columnas completadas: [10, 14, 16, 20]
    // ============================================================
    amarilla: {
        columnas: [10, 14, 16, 20],
        calcular: function() {
            let puntos = 0;
            
            if (typeof columnasCompletadas !== 'undefined' && columnasCompletadas) {
                columnasCompletadas.forEach((completada, index) => {
                    if (completada) {
                        puntos += this.columnas[index];
                    }
                });
            }
            
            return puntos;
        }
    },

    // ============================================================
    // ÁREA AZUL - Puntaje DIRECTO según cantidad de casillas
    // (SIN bonificaciones de columnas)
    // ============================================================
    azul: {
        puntajes: [1, 2, 4, 7, 11, 16, 22, 29, 37, 46, 56],
        calcular: function() {
            let puntos = 0;
            let casillasMarcadas = 0;
            
            if (typeof TABLA_AZUL !== 'undefined' && TABLA_AZUL && typeof historialMovimientos !== 'undefined') {
                TABLA_AZUL.forEach((celda, index) => {
                    if (celda.valor !== '') {
                        const id = `azul-tabla-${index}`;
                        if (historialMovimientos.includes(id)) {
                            casillasMarcadas++;
                        }
                    }
                });
            } else {
                casillasMarcadas = historialMovimientos ? historialMovimientos.filter(m => 
                    m.startsWith('azul-tabla-')
                ).length : 0;
            }
            
            window.progresoAzul = casillasMarcadas;
            
            // Puntaje DIRECTO (sin bonificaciones de columnas)
            if (casillasMarcadas > 0 && casillasMarcadas <= this.puntajes.length) {
                puntos = this.puntajes[casillasMarcadas - 1];
            }
            
            return puntos;
        }
    },

    // ============================================================
    // ÁREA VERDE - Puntaje DIRECTO según cantidad de casillas
    // ============================================================
    verde: {
        puntajes: [1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66],
        calcular: function() {
            let puntos = 0;
            const marcas = historialMovimientos ? historialMovimientos.filter(m => 
                m.startsWith('verde-tabla-')
            ).length : 0;
            
            // Puntaje DIRECTO
            if (marcas > 0 && marcas <= this.puntajes.length) {
                puntos = this.puntajes[marcas - 1];
            }
            
            return puntos;
        }
    },

    // ============================================================
    // ÁREA NARANJA - Suma de valores × multiplicadores
    // ============================================================
    naranja: {
        calcular: function() {
            let puntos = 0;
            
            if (typeof valoresNaranja !== 'undefined' && valoresNaranja && typeof NARANJA_CONFIG !== 'undefined' && NARANJA_CONFIG) {
                NARANJA_CONFIG.forEach((celda, index) => {
                    const id = `naranja-${index}`;
                    if (historialMovimientos && historialMovimientos.includes(id)) {
                        const valor = valoresNaranja[index] || 0;
                        puntos += valor;
                    }
                });
            }
            
            return puntos;
        }
    },

    // ============================================================
    // ÁREA MORADO - Suma de números elegidos
    // ============================================================
    morado: {
        calcular: function() {
            let puntos = 0;
            
            if (typeof valoresMorado !== 'undefined' && valoresMorado && typeof MORADO_CONFIG !== 'undefined' && MORADO_CONFIG) {
                MORADO_CONFIG.forEach((celda, index) => {
                    const id = `morado-${index}`;
                    if (historialMovimientos && historialMovimientos.includes(id)) {
                        const valor = valoresMorado[index] || 0;
                        puntos += valor;
                    }
                });
            }
            
            return puntos;
        }
    },

    // ============================================================
    // ÁREA GRIS - Suma triangular de habilidades usadas
    // ============================================================
    gris: {
        calcular: function() {
            const marcas = historialMovimientos ? historialMovimientos.filter(m => 
                m.startsWith('gris-') && !m.includes('turno')
            ).length : 0;
            
            let puntos = 0;
            if (marcas > 0) {
                puntos = marcas * (marcas + 1) / 2;
            }
            
            return puntos;
        }
    },

    // ============================================================
    // BONIFICACIONES GLOBALES
    // ============================================================
    bonificaciones: {
        calcular: function() {
            return puntosBonificacion || 0;
        }
    },

    // ============================================================
    // CALCULAR PUNTAJE TOTAL (INCLUYENDO LOBOS)
    // ============================================================
    calcularTotal: function() {
        let total = 0;
        const areas = ['gris', 'amarilla', 'azul', 'verde', 'naranja', 'morado'];
        
        if (typeof historialMovimientos === 'undefined') {
            window.historialMovimientos = [];
        }
        
        // Sumar todas las áreas
        areas.forEach(area => {
            if (this[area] && typeof this[area].calcular === 'function') {
                try {
                    const puntos = this[area].calcular();
                    if (typeof puntajesAreas !== 'undefined' && puntajesAreas) {
                        puntajesAreas[area] = puntos;
                    }
                    total += puntos;
                } catch(e) {
                    console.warn(`Error calculando área ${area}:`, e);
                }
            }
        });
        
        // Sumar bonificaciones
        const bonus = this.bonificaciones.calcular();
        total += bonus;
        
        // ✅ SUMAR LOBOS AL TOTAL
        let puntosLobos = 0;
        if (typeof lobos !== 'undefined' && lobos) {
            puntosLobos = lobos.totalPuntos || 0;
            total += puntosLobos;
        }
        
        // Guardar en puntajesAreas para referencia
        if (typeof puntajesAreas !== 'undefined' && puntajesAreas) {
            puntajesAreas.lobos = puntosLobos;
        }
        
        if (typeof puntajeTotal !== 'undefined') {
            window.puntajeTotal = total;
        }
        
        // ACTUALIZAR PUNTAJES EN LA UI
        const totalElement = document.getElementById('score-total');
        const bonusElement = document.getElementById('bonus-display');
        if (totalElement) totalElement.textContent = total;
        if (bonusElement) bonusElement.textContent = bonus;
        
        if (typeof puntajesAreas !== 'undefined' && puntajesAreas) {
            const areasList = ['gris', 'amarilla', 'azul', 'verde', 'naranja', 'morado'];
            areasList.forEach(area => {
                const element = document.getElementById(`score-${area}`);
                if (element) {
                    element.textContent = puntajesAreas[area] || 0;
                }
            });
        }
        
        // ACTUALIZAR LOBOS DESPUÉS DE CALCULAR
        if (typeof actualizarValorLobo === 'function') {
            actualizarValorLobo();
        }
        if (typeof actualizarUI === 'function') {
            actualizarUI();
        }
        
        return total;
    },

    // ============================================================
    // OBTENER PUNTAJE POR ÁREA (para leaderboard) - INCLUYE LOBOS
    // ============================================================
    obtenerPuntajesPorArea: function() {
        // Primero calcular para asegurar que todo esté actualizado
        const total = this.calcularTotal();
        
        // Obtener puntos de lobos
        let puntosLobos = 0;
        if (typeof lobos !== 'undefined' && lobos) {
            puntosLobos = lobos.totalPuntos || 0;
        }
        
        return {
            gris: (typeof puntajesAreas !== 'undefined' && puntajesAreas) ? puntajesAreas.gris || 0 : 0,
            amarilla: (typeof puntajesAreas !== 'undefined' && puntajesAreas) ? puntajesAreas.amarilla || 0 : 0,
            azul: (typeof puntajesAreas !== 'undefined' && puntajesAreas) ? puntajesAreas.azul || 0 : 0,
            verde: (typeof puntajesAreas !== 'undefined' && puntajesAreas) ? puntajesAreas.verde || 0 : 0,
            naranja: (typeof puntajesAreas !== 'undefined' && puntajesAreas) ? puntajesAreas.naranja || 0 : 0,
            morado: (typeof puntajesAreas !== 'undefined' && puntajesAreas) ? puntajesAreas.morado || 0 : 0,
            bonificacion: puntosBonificacion || 0,
            lobos: puntosLobos,  // ✅ Incluir lobos como un área más
            total: total,        // ✅ Total YA INCLUYE lobos
            // También incluir los detalles de lobos para el tag
            lobosDetalle: {
                cantidad: (typeof lobos !== 'undefined' && lobos) ? lobos.cantidad || 0 : 0,
                valorActual: (typeof lobos !== 'undefined' && lobos) ? lobos.valorActual || 0 : 0,
                totalPuntos: (typeof lobos !== 'undefined' && lobos) ? lobos.totalPuntos || 0 : 0,
                colorMenor: (typeof lobos !== 'undefined' && lobos) ? lobos.colorMenor || 'amarilla' : 'amarilla'
            }
        };
    }
};

// ============================================================
// EXPORTAR
// ============================================================

window.PUNTAJES = PUNTAJES;

console.log('📊 Sistema de puntuaciones cargado correctamente (con lobos incluidos)');