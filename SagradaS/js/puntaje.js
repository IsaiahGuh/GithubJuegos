// ===== PUNTAJE.JS =====
// Lógica de cálculo de puntuación (con finalización)

// ============================================================
// CÁLCULO DE PUNTUACIÓN COMPLETA (sin base)
// ============================================================

function calcularPuntuacionCompleta(card, moves, privateObjectiveId, publicObjectiveIds, playerId, isFinished = false) {
    // 1. Objetivo Privado
    let privateScore = 0;
    if (privateObjectiveId) {
        privateScore = calcularObjetivoPrivado(privateObjectiveId, card, moves);
    }
    
    // 2. Objetivos Públicos
    const publicScores = [];
    let publicTotal = 0;
    if (publicObjectiveIds && publicObjectiveIds.length > 0) {
        publicObjectiveIds.forEach(objId => {
            const result = calcularObjetivoPublicoDetallado(objId, card, moves);
            publicScores.push(result);
            publicTotal += result.puntos;
        });
    }
    
    // 3. Puntos extra por color
    let colorExtra = 0;
    if (typeof window.calcularPuntosExtraColor === 'function') {
        colorExtra = window.calcularPuntosExtraColor(playerId, card, moves);
    }
    
    // ===== NUEVO: 4. Favores no usados (+1 cada uno) y casillas vacías (-1 cada una) =====
    let favoresPuntos = 0;
    let casillasVaciasPuntos = 0;
    
    if (isFinished) {
        // Favores no usados
        const favoresDisponibles = herramientasState.favores.disponibles || 0;
        favoresPuntos = favoresDisponibles; // +1 por cada favor no usado
        
        // Casillas vacías (no marcadas)
        let celdasVacias = 0;
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 5; col++) {
                const moveId = `${row}-${col}`;
                if (!moves.includes(moveId)) {
                    celdasVacias++;
                }
            }
        }
        casillasVaciasPuntos = -celdasVacias; // -1 por cada casilla vacía
    }
    
    return {
        private: privateScore,
        public: publicTotal,
        publicDetalle: publicScores,
        colorExtra: colorExtra,
        favoresPuntos: favoresPuntos,      // NUEVO
        casillasVaciasPuntos: casillasVaciasPuntos, // NUEVO
        total: privateScore + publicTotal + colorExtra + favoresPuntos + casillasVaciasPuntos
    };
}

// ============================================================
// CÁLCULO DE OBJETIVO PRIVADO
// ============================================================

function calcularObjetivoPrivado(objetivoId, card, moves) {
    const objetivo = getObjetivoPrivadoById(objetivoId);
    if (!objetivo) return 0;
    
    let total = 0;
    const patron = objetivo.patron;
    
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 5; col++) {
            if (patron[row][col] === 1) {
                const cell = card.rows[row][col];
                const isMarked = moves.includes(`${row}-${col}`);
                if (isMarked && cell.value !== null && cell.value !== undefined) {
                    total += cell.value;
                }
            }
        }
    }
    return total;
}

// ============================================================
// CÁLCULO DE OBJETIVO PÚBLICO (con detalle de "veces")
// ============================================================

function calcularObjetivoPublicoDetallado(objetivoId, card, moves) {
    const objetivo = getObjetivoPublicoById(objetivoId);
    if (!objetivo) return { nombre: 'Desconocido', veces: 0, puntos: 0 };
    
    const puntos = calcularObjetivoPublico(objetivoId, card, moves);
    const veces = calcularVecesObjetivoPublico(objetivoId, card, moves);
    
    return {
        nombre: objetivo.nombre,
        veces: veces,
        puntos: puntos,
        id: objetivoId
    };
}

// ============================================================
// CÁLCULO DE PUNTOS DE OBJETIVO PÚBLICO
// ============================================================

function calcularObjetivoPublico(objetivoId, card, moves) {
    switch (objetivoId) {
        case 1: // Pareja 1-2
            return calcularPareja(card, moves, 1, 2) * 2;
        case 2: // Columnas Únicas (Color)
            return calcularColumnasUnicas(card, moves, 'color') * 5;
        case 3: // Columnas Únicas (Valor)
            return calcularColumnasUnicas(card, moves, 'valor') * 4;
        case 4: // Diagonal del Mismo Color
            return calcularDiagonalMismoColor(card, moves);
        case 5: // Filas Únicas (Valor)
            return calcularFilasUnicas(card, moves, 'valor') * 5;
        case 6: // Pareja 3-4
            return calcularPareja(card, moves, 3, 4) * 2;
        case 7: // Escalera Completa
            return calcularEscaleraCompleta(card, moves) ? 5 : 0;
        case 8: // Pareja 5-6
            return calcularPareja(card, moves, 5, 6) * 2;
        case 9: // Filas Únicas (Color)
            return calcularFilasUnicas(card, moves, 'color') * 6;
        case 10: // Arcoíris
            return calcularArcoiris(card, moves) ? 4 : 0;
        default:
            return 0;
    }
}

// ============================================================
// CÁLCULO DE "VECES" PARA CADA TIPO DE OBJETIVO PÚBLICO
// ============================================================

function calcularVecesObjetivoPublico(objetivoId, card, moves) {
    switch (objetivoId) {
        case 1: // Pareja 1-2
        case 6: // Pareja 3-4
        case 8: // Pareja 5-6
            const [v1, v2] = objetivoId === 1 ? [1,2] : objetivoId === 6 ? [3,4] : [5,6];
            return contarParejas(card, moves, v1, v2);
        case 2: // Columnas Únicas (Color)
            return contarColumnasUnicas(card, moves, 'color');
        case 3: // Columnas Únicas (Valor)
            return contarColumnasUnicas(card, moves, 'valor');
        case 4: // Diagonal del Mismo Color
            return contarDiagonales(card, moves);
        case 5: // Filas Únicas (Valor)
            return contarFilasUnicas(card, moves, 'valor');
        case 7: // Escalera Completa
            return calcularEscaleraCompleta(card, moves) ? 1 : 0;
        case 9: // Filas Únicas (Color)
            return contarFilasUnicas(card, moves, 'color');
        case 10: // Arcoíris
            return calcularArcoiris(card, moves) ? 1 : 0;
        default:
            return 0;
    }
}

// ============================================================
// FUNCIONES DE CÁLCULO ESPECÍFICAS
// ============================================================

function calcularPareja(card, moves, val1, val2) {
    let count1 = 0, count2 = 0;
    card.rows.forEach((row, r) => {
        row.forEach((cell, c) => {
            const isMarked = moves.includes(`${r}-${c}`);
            if (isMarked && cell.value === val1) count1++;
            if (isMarked && cell.value === val2) count2++;
        });
    });
    return Math.min(count1, count2);
}

function contarParejas(card, moves, val1, val2) {
    return calcularPareja(card, moves, val1, val2);
}

function calcularColumnasUnicas(card, moves, tipo) {
    let count = 0;
    for (let col = 0; col < 5; col++) {
        const set = new Set();
        let valid = true;
        let filled = true;
        for (let row = 0; row < 4; row++) {
            const cell = card.rows[row][col];
            const isMarked = moves.includes(`${row}-${col}`);
            const value = tipo === 'color' ? cell.color : cell.value;
            
            if (!isMarked) {
                filled = false;
                break;
            }
            
            if (!value) {
                filled = false;
                break;
            }
            
            if (set.has(value)) {
                valid = false;
                break;
            }
            set.add(value);
        }
        
        if (filled && valid && set.size > 0) {
            count++;
        }
    }
    return count;
}

function contarColumnasUnicas(card, moves, tipo) {
    return calcularColumnasUnicas(card, moves, tipo);
}

function calcularFilasUnicas(card, moves, tipo) {
    let count = 0;
    for (let row = 0; row < 4; row++) {
        const set = new Set();
        let valid = true;
        let filled = true;
        for (let col = 0; col < 5; col++) {
            const cell = card.rows[row][col];
            const isMarked = moves.includes(`${row}-${col}`);
            const value = tipo === 'color' ? cell.color : cell.value;
            
            if (!isMarked) {
                filled = false;
                break;
            }
            
            if (!value) {
                filled = false;
                break;
            }
            
            if (set.has(value)) {
                valid = false;
                break;
            }
            set.add(value);
        }
        
        if (filled && valid && set.size > 0) {
            count++;
        }
    }
    return count;
}

function contarFilasUnicas(card, moves, tipo) {
    return calcularFilasUnicas(card, moves, tipo);
}

function calcularDiagonalMismoColor(card, moves) {
    let total = 0;
    const directions = [[1,1],[1,-1],[-1,1],[-1,-1]];
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = card.rows[row][col];
            const isMarked = moves.includes(`${row}-${col}`);
            if (!isMarked || !cell.color || !cell.value) continue;
            for (const [dr, dc] of directions) {
                const nr = row + dr, nc = col + dc;
                if (nr >= 0 && nr < 4 && nc >= 0 && nc < 5) {
                    const neighbor = card.rows[nr][nc];
                    const isNeighborMarked = moves.includes(`${nr}-${nc}`);
                    if (isNeighborMarked && neighbor.color === cell.color && neighbor.value) {
                        total += cell.value;
                        break;
                    }
                }
            }
        }
    }
    return total;
}

function contarDiagonales(card, moves) {
    let count = 0;
    const directions = [[1,1],[1,-1],[-1,1],[-1,-1]];
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = card.rows[row][col];
            const isMarked = moves.includes(`${row}-${col}`);
            if (!isMarked || !cell.color || !cell.value) continue;
            for (const [dr, dc] of directions) {
                const nr = row + dr, nc = col + dc;
                if (nr >= 0 && nr < 4 && nc >= 0 && nc < 5) {
                    const neighbor = card.rows[nr][nc];
                    const isNeighborMarked = moves.includes(`${nr}-${nc}`);
                    if (isNeighborMarked && neighbor.color === cell.color && neighbor.value) {
                        count++;
                        break;
                    }
                }
            }
        }
    }
    return count;
}

function calcularEscaleraCompleta(card, moves) {
    const values = new Set();
    card.rows.forEach((row, r) => {
        row.forEach((cell, c) => {
            const isMarked = moves.includes(`${r}-${c}`);
            if (isMarked && cell.value) values.add(cell.value);
        });
    });
    return values.size >= 6;
}

function calcularArcoiris(card, moves) {
    const colors = new Set();
    card.rows.forEach((row, r) => {
        row.forEach((cell, c) => {
            const isMarked = moves.includes(`${r}-${c}`);
            if (isMarked && cell.color) colors.add(cell.color);
        });
    });
    const allColors = ['red', 'yellow', 'green', 'blue', 'purple'];
    const matched = allColors.filter(c => colors.has(c));
    return matched.length >= 5;
}

// ============================================================
// EXPORTAR
// ============================================================

window.calcularPuntuacionCompleta = calcularPuntuacionCompleta;
window.calcularObjetivoPrivado = calcularObjetivoPrivado;
window.calcularObjetivoPublicoDetallado = calcularObjetivoPublicoDetallado;
window.calcularObjetivoPublico = calcularObjetivoPublico;
window.calcularVecesObjetivoPublico = calcularVecesObjetivoPublico;

console.log('✅ puntaje.js cargado - Con soporte para finalización de partida');