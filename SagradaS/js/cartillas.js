// ===== CARTILLAS.JS =====
// Definicion de las 21 cartillas del juego SagradaS

const CARTILLAS = [
    // Cartilla 1 (dif 3)
    {
        id: 1,
        difficulty: 3,
        rows: [
            [{ value: null, color: null }, { value: null, color: 'blue' }, { value: 2, color: null }, { value: null, color: null }, { value: null, color: 'yellow' }],
            [{ value: null, color: null }, { value: 4, color: null }, { value: null, color: null }, { value: null, color: 'red' }, { value: null, color: null }],
            [{ value: null, color: null }, { value: null, color: null }, { value: 5, color: null }, { value: null, color: 'yellow' }, { value: null, color: null }],
            [{ value: null, color: 'green' }, { value: 3, color: null }, { value: null, color: null }, { value: null, color: null }, { value: null, color: 'purple' }]
        ]
    },
    // Cartilla 2 (dif 3)
    {
        id: 2,
        difficulty: 3,
        rows: [
            [{ value: null, color: null }, { value: null, color: 'red' }, { value: null, color: null }, { value: 5, color: null }, { value: null, color: null }],
            [{ value: null, color: 'purple' }, { value: 4, color: null }, { value: null, color: null }, { value: null, color: 'green' }, { value: 3, color: null }],
            [{ value: 6, color: null }, { value: null, color: null }, { value: null, color: null }, { value: null, color: 'blue' }, { value: null, color: null }],
            [{ value: null, color: null }, { value: null, color: 'yellow' }, { value: 2, color: null }, { value: null, color: null }, { value: null, color: null }]
        ]
    },
    // Cartilla 3 (dif 3)
    {
        id: 3,
        difficulty: 3,
        rows: [
            [{ value: null, color: null }, { value: 4, color: null }, { value: null, color: null }, { value: null, color: 'yellow' }, { value: 6, color: null }],
            [{ value: null, color: 'red' }, { value: null, color: null }, { value: 2, color: null }, { value: null, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: null, color: null }, { value: null, color: 'red' }, { value: null, color: 'purple' }, { value: 1, color: null }],
            [{ value: null, color: 'blue' }, { value: null, color: 'yellow' }, { value: null, color: null }, { value: null, color: null }, { value: null, color: null }]
        ]
    },
    // Cartilla 4 (dif 3)
    {
        id: 4,
        difficulty: 3,
        rows: [
            [{ value: null, color: 'blue' }, { value: 6, color: null }, { value: null, color: null }, { value: null, color: null }, { value: null, color: 'yellow' }],
            [{ value: null, color: null }, { value: 3, color: null }, { value: null, color: 'blue' }, { value: null, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: 5, color: null }, { value: 6, color: null }, { value: 2, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: null, color: null }, { value: null, color: null }, { value: 1, color: null }, { value: null, color: 'green' }]
        ]
    },
    // Cartilla 5 (dif 4)
    {
        id: 5,
        difficulty: 4,
        rows: [
            [{ value: null, color: 'yellow' }, { value: null, color: null }, { value: 6, color: null }, { value: null, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: 1, color: null }, { value: 5, color: null }, { value: null, color: null }, { value: 2, color: null }],
            [{ value: 3, color: null }, { value: null, color: 'yellow' }, { value: null, color: 'red' }, { value: null, color: 'purple' }, { value: null, color: null }],
            [{ value: null, color: null }, { value: null, color: null }, { value: 4, color: null }, { value: 3, color: null }, { value: null, color: 'red' }]
        ]
    },
    // Cartilla 6 (dif 5)
    {
        id: 6,
        difficulty: 5,
        rows: [
            [{ value: 3, color: null }, { value: 4, color: null }, { value: 1, color: null }, { value: 5, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: 6, color: null }, { value: 2, color: null }, { value: null, color: null }, { value: null, color: 'yellow' }],
            [{ value: null, color: null }, { value: null, color: null }, { value: null, color: null }, { value: null, color: 'yellow' }, { value: null, color: 'red' }],
            [{ value: 5, color: null }, { value: null, color: null }, { value: null, color: 'yellow' }, { value: null, color: 'red' }, { value: 6, color: null }]
        ]
    },
    // Cartilla 7 (dif 5)
    {
        id: 7,
        difficulty: 5,
        rows: [
            [{ value: 5, color: null }, { value: null, color: 'green' }, { value: null, color: 'blue' }, { value: null, color: 'purple' }, { value: 2, color: null }],
            [{ value: null, color: 'purple' }, { value: null, color: null }, { value: null, color: null }, { value: null, color: null }, { value: null, color: 'yellow' }],
            [{ value: null, color: 'yellow' }, { value: null, color: null }, { value: 6, color: null }, { value: null, color: null }, { value: null, color: 'purple' }],
            [{ value: 1, color: null }, { value: null, color: null }, { value: null, color: null }, { value: null, color: 'green' }, { value: 4, color: null }]
        ]
    },
    // Cartilla 8 (dif 5)
    {
        id: 8,
        difficulty: 5,
        rows: [
            [{ value: null, color: 'yellow' }, { value: null, color: null }, { value: 2, color: null }, { value: null, color: null }, { value: 6, color: null }],
            [{ value: null, color: null }, { value: 4, color: null }, { value: null, color: null }, { value: 5, color: null }, { value: null, color: 'yellow' }],
            [{ value: null, color: null }, { value: null, color: null }, { value: null, color: null }, { value: null, color: 'yellow' }, { value: 5, color: null }],
            [{ value: 1, color: null }, { value: 2, color: null }, { value: null, color: 'yellow' }, { value: 3, color: null }, { value: null, color: null }]
        ]
    },
    // Cartilla 9 (dif 5)
    {
        id: 9,
        difficulty: 5,
        rows: [
            [{ value: 4, color: null }, { value: null, color: null }, { value: 2, color: null }, { value: 5, color: null }, { value: null, color: 'green' }],
            [{ value: null, color: null }, { value: null, color: null }, { value: 6, color: null }, { value: null, color: 'green' }, { value: 2, color: null }],
            [{ value: null, color: null }, { value: 3, color: null }, { value: null, color: 'green' }, { value: 4, color: null }, { value: null, color: null }],
            [{ value: 5, color: null }, { value: null, color: 'green' }, { value: 1, color: null }, { value: null, color: null }, { value: null, color: null }]
        ]
    },
    // Cartilla 10 (dif 5)
    {
        id: 10,
        difficulty: 5,
        rows: [
            [{ value: null, color: 'purple' }, { value: 6, color: null }, { value: null, color: null }, { value: null, color: null }, { value: 3, color: null }],
            [{ value: 5, color: null }, { value: null, color: 'purple' }, { value: 3, color: null }, { value: null, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: 2, color: null }, { value: null, color: 'purple' }, { value: 1, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: 1, color: null }, { value: 5, color: null }, { value: null, color: 'purple' }, { value: 4, color: null }]
        ]
    },
    // Cartilla 11 (dif 6)
    {
        id: 11,
        difficulty: 6,
        rows: [
            [{ value: 6, color: null }, { value: null, color: 'blue' }, { value: null, color: null }, { value: null, color: null }, { value: 1, color: null }],
            [{ value: null, color: null }, { value: 5, color: null }, { value: null, color: 'blue' }, { value: null, color: null }, { value: null, color: null }],
            [{ value: 4, color: null }, { value: null, color: 'red' }, { value: 2, color: null }, { value: null, color: 'blue' }, { value: null, color: null }],
            [{ value: null, color: 'green' }, { value: 6, color: null }, { value: null, color: 'yellow' }, { value: 3, color: null }, { value: null, color: 'purple' }]
        ]
    },
    // Cartilla 12 (dif 6)
    {
        id: 12,
        difficulty: 6,
        rows: [
            [{ value: null, color: null }, { value: null, color: null }, { value: 1, color: null }, { value: null, color: null }, { value: null, color: null }],
            [{ value: 1, color: null }, { value: null, color: 'green' }, { value: 3, color: null }, { value: null, color: 'blue' }, { value: 2, color: null }],
            [{ value: null, color: 'blue' }, { value: 5, color: null }, { value: 4, color: null }, { value: 6, color: null }, { value: null, color: 'green' }],
            [{ value: null, color: null }, { value: null, color: 'blue' }, { value: 5, color: null }, { value: null, color: 'green' }, { value: null, color: null }]
        ]
    },
    // Cartilla 13 (dif 3) - identica a la 3
    {
        id: 13,
        difficulty: 3,
        rows: [
            [{ value: null, color: null }, { value: 4, color: null }, { value: null, color: null }, { value: null, color: 'yellow' }, { value: 6, color: null }],
            [{ value: null, color: 'red' }, { value: null, color: null }, { value: 2, color: null }, { value: null, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: null, color: null }, { value: null, color: 'red' }, { value: null, color: 'purple' }, { value: 1, color: null }],
            [{ value: null, color: 'blue' }, { value: null, color: 'yellow' }, { value: null, color: null }, { value: null, color: null }, { value: null, color: null }]
        ]
    },
    // Cartilla 14 (dif 4)
    {
        id: 14,
        difficulty: 4,
        rows: [
            [{ value: 1, color: null }, { value: 2, color: null }, { value: null, color: null }, { value: null, color: null }, { value: null, color: null }],
            [{ value: null, color: 'green' }, { value: null, color: 'blue' }, { value: 4, color: null }, { value: 1, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: null, color: 'green' }, { value: null, color: 'blue' }, { value: 6, color: null }, { value: 1, color: null }],
            [{ value: 6, color: null }, { value: 3, color: null }, { value: null, color: null }, { value: null, color: null }, { value: null, color: null }]
        ]
    },
    // Cartilla 15 (dif 6)
    {
        id: 15,
        difficulty: 6,
        rows: [
            [{ value: 2, color: null }, { value: null, color: null }, { value: 5, color: null }, { value: null, color: null }, { value: 1, color: null }],
            [{ value: null, color: 'yellow' }, { value: 6, color: null }, { value: null, color: 'purple' }, { value: 2, color: null }, { value: null, color: 'red' }],
            [{ value: null, color: null }, { value: null, color: 'blue' }, { value: 4, color: null }, { value: null, color: 'green' }, { value: null, color: null }],
            [{ value: null, color: null }, { value: 3, color: null }, { value: null, color: null }, { value: 5, color: null }, { value: null, color: null }]
        ]
    },
    // Cartilla 16 (dif 6)
    {
        id: 16,
        difficulty: 6,
        rows: [
            [{ value: null, color: null }, { value: 5, color: null }, { value: null, color: 'green' }, { value: null, color: null }, { value: null, color: null }],
            [{ value: 5, color: null }, { value: null, color: 'blue' }, { value: 1, color: null }, { value: null, color: null }, { value: 6, color: null }],
            [{ value: 2, color: null }, { value: null, color: null }, { value: null, color: 'blue' }, { value: null, color: 'purple' }, { value: null, color: 'green' }],
            [{ value: null, color: 'purple' }, { value: null, color: null }, { value: 3, color: null }, { value: 6, color: null }, { value: 1, color: null }]
        ]
    },
    // Cartilla 17 (dif 3)
    {
        id: 17,
        difficulty: 3,
        rows: [
            [{ value: 1, color: null }, { value: null, color: null }, { value: null, color: null }, { value: null, color: 'yellow' }, { value: null, color: null }],
            [{ value: null, color: null }, { value: null, color: null }, { value: null, color: 'yellow' }, { value: 5, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: null, color: 'yellow' }, { value: null, color: null }, { value: null, color: null }, { value: 6, color: null }],
            [{ value: null, color: 'yellow' }, { value: 3, color: null }, { value: null, color: null }, { value: 2, color: null }, { value: null, color: 'green' }]
        ]
    },
    // Cartilla 18 (dif 6)
    {
        id: 18,
        difficulty: 6,
        rows: [
            [{ value: null, color: null }, { value: null, color: null }, { value: null, color: 'red' }, { value: null, color: null }, { value: null, color: null }],
            [{ value: null, color: 'yellow' }, { value: null, color: 'red' }, { value: 5, color: null }, { value: null, color: 'blue' }, { value: null, color: 'purple' }],
            [{ value: 1, color: null }, { value: null, color: null }, { value: null, color: 'purple' }, { value: null, color: null }, { value: 2, color: null }],
            [{ value: 3, color: null }, { value: null, color: 'yellow' }, { value: 6, color: null }, { value: null, color: 'red' }, { value: 5, color: null }]
        ]
    },
    // Cartilla 19 (dif 5)
    {
        id: 19,
        difficulty: 5,
        rows: [
            [{ value: null, color: null }, { value: null, color: null }, { value: null, color: null }, { value: null, color: 'red' }, { value: 5, color: null }],
            [{ value: null, color: null }, { value: null, color: null }, { value: null, color: 'purple' }, { value: 4, color: null }, { value: null, color: 'blue' }],
            [{ value: null, color: null }, { value: null, color: 'blue' }, { value: 3, color: null }, { value: null, color: 'yellow' }, { value: 6, color: null }],
            [{ value: null, color: 'yellow' }, { value: 2, color: null }, { value: null, color: 'green' }, { value: 1, color: null }, { value: null, color: 'red' }]
        ]
    },
    // Cartilla 20 (dif 5)
    {
        id: 20,
        difficulty: 5,
        rows: [
            [{ value: null, color: null }, { value: null, color: 'blue' }, { value: null, color: 'red' }, { value: null, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: 4, color: null }, { value: 5, color: null }, { value: null, color: null }, { value: null, color: 'blue' }],
            [{ value: null, color: 'blue' }, { value: 2, color: null }, { value: null, color: null }, { value: null, color: 'red' }, { value: 5, color: null }],
            [{ value: 6, color: null }, { value: null, color: 'red' }, { value: 3, color: null }, { value: 1, color: null }, { value: null, color: null }]
        ]
    },
    // Cartilla 21 (dif 4)
    {
        id: 21,
        difficulty: 4,
        rows: [
            [{ value: null, color: 'yellow' }, { value: null, color: null }, { value: 6, color: null }, { value: null, color: null }, { value: null, color: null }],
            [{ value: null, color: null }, { value: 1, color: null }, { value: 5, color: null }, { value: null, color: null }, { value: 2, color: null }],
            [{ value: 3, color: null }, { value: null, color: 'yellow' }, { value: null, color: 'red' }, { value: null, color: 'purple' }, { value: null, color: null }],
            [{ value: null, color: null }, { value: null, color: null }, { value: 4, color: null }, { value: 3, color: null }, { value: null, color: 'red' }]
        ]
    }
];

// ===== MAPA DE COLORES =====
const COLOR_MAP = {
    'rojo': 'color-red',
    'amarillo': 'color-yellow',
    'verde': 'color-green',
    'celeste': 'color-blue',
    'morado': 'color-purple',
    'amarllo': 'color-yellow',
    'blue': 'color-blue',
    'red': 'color-red',
    'yellow': 'color-yellow',
    'green': 'color-green',
    'purple': 'color-purple'
};

// ===== FUNCIONES DE CARTILLAS =====

// Obtener una cartilla por ID
function getCardById(id) {
    return CARTILLAS.find(c => c.id === id) || CARTILLAS[0];
}

// Obtener todas las cartillas
function getAllCards() {
    return CARTILLAS;
}

// Obtener cartillas por dificultad
function getCardsByDifficulty(difficulty) {
    return CARTILLAS.filter(c => c.difficulty === difficulty);
}

// Obtener la clase CSS para el color de una celda
function getCellColorClass(cell) {
    if (cell.color) {
        return COLOR_MAP[cell.color] || null;
    }
    return null;
}

// Verificar si una celda tiene valor (número)
function hasValue(cell) {
    return cell.value !== null && cell.value !== undefined;
}