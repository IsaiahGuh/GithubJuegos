// ===== OBJETIVOS.JS =====
// Definición de objetivos privados y públicos (SOLO DATOS)

// ============================================
// OBJETIVOS PRIVADOS (18)
// ============================================
// Cada objetivo privado es una matriz 4x5 con 1 indicando las celdas que suman

const OBJETIVOS_PRIVADOS = [
    {
        id: 1,
        nombre: "Patrón 1",
        patron: [
            [0, 0, 0, 1, 1],
            [0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0],
            [1, 1, 0, 0, 0]
        ]
    },
    {
        id: 2,
        nombre: "Patrón 2",
        patron: [
            [1, 1, 0, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 0, 1, 1]
        ]
    },
    {
        id: 3,
        nombre: "Patrón 3",
        patron: [
            [1, 0, 0, 0, 0],
            [1, 0, 0, 0, 1],
            [1, 0, 0, 0, 1],
            [0, 0, 0, 0, 1]
        ]
    },
    {
        id: 4,
        nombre: "Patrón 4",
        patron: [
            [0, 1, 0, 0, 0],
            [1, 1, 0, 0, 0],
            [0, 0, 0, 1, 1],
            [0, 0, 0, 1, 0]
        ]
    },
    {
        id: 5,
        nombre: "Patrón 5",
        patron: [
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0]
        ]
    },
    {
        id: 6,
        nombre: "Patrón 6",
        patron: [
            [0, 1, 0, 0, 0],
            [0, 1, 1, 0, 0],
            [0, 0, 1, 1, 0],
            [0, 0, 0, 1, 0]
        ]
    },
    {
        id: 7,
        nombre: "Patrón 7",
        patron: [
            [0, 1, 0, 1, 0],
            [1, 0, 0, 0, 1],
            [1, 0, 0, 0, 1],
            [0, 0, 0, 0, 0]
        ]
    },
    {
        id: 8,
        nombre: "Patrón 8",
        patron: [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [1, 0, 0, 0, 1],
            [1, 1, 0, 1, 1]
        ]
    },
    {
        id: 9,
        nombre: "Patrón 9",
        patron: [
            [1, 1, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [0, 0, 0, 0, 1],
            [0, 0, 0, 1, 1]
        ]
    },
    {
        id: 10,
        nombre: "Patrón 10",
        patron: [
            [0, 0, 0, 0, 0],
            [0, 1, 1, 1, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 0, 0, 0]
        ]
    },
    {
        id: 11,
        nombre: "Patrón 11",
        patron: [
            [0, 1, 0, 1, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 1, 0, 1, 0]
        ]
    },
    {
        id: 12,
        nombre: "Patrón 12",
        patron: [
            [0, 0, 1, 0, 0],
            [0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0],
            [0, 0, 1, 0, 0]
        ]
    },
    {
        id: 13,
        nombre: "Patrón 13",
        patron: [
            [0, 0, 0, 0, 0],
            [1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1],
            [0, 0, 0, 0, 0]
        ]
    },
    {
        id: 14,
        nombre: "Patrón 14",
        patron: [
            [1, 1, 0, 1, 1],
            [1, 0, 0, 0, 1],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ]
    },
    {
        id: 15,
        nombre: "Patrón 15",
        patron: [
            [0, 1, 1, 1, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 1, 1, 1, 0]
        ]
    },
    {
        id: 16,
        nombre: "Patrón 16",
        patron: [
            [0, 1, 1, 1, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0]
        ]
    },
    {
        id: 17,
        nombre: "Patrón 17",
        patron: [
            [0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [1, 1, 0, 1, 1]
        ]
    },
    {
        id: 18,
        nombre: "Patrón 18",
        patron: [
            [0, 1, 0, 1, 0],
            [1, 0, 0, 0, 1],
            [0, 0, 0, 0, 0],
            [0, 1, 0, 1, 0]
        ]
    }
];

// ============================================
// OBJETIVOS PÚBLICOS (10) - SOLO DEFINICIONES
// ============================================

const OBJETIVOS_PUBLICOS = [
    { 
        id: 1, 
        nombre: "Luces Suaves", 
        descripcion: "Conjunto de valores 1 y 2", 
        puntos_base: 2 
    },
    { 
        id: 2, 
        nombre: "Columnas Color", 
        descripcion: "Columnas sin colores repetidos", 
        puntos_base: 5 
    },
    { 
        id: 3, 
        nombre: "Columnas Valor", 
        descripcion: "Columnas sin valores repetidos", 
        puntos_base: 4 
    },
    { 
        id: 4, 
        nombre: "Color Diagonal", 
        descripcion: "Suma de dados del mismo color diagonalmente adyacentes", 
        puntos_base: 0 
    },
    { 
        id: 5, 
        nombre: "Filas Valor", 
        descripcion: "Filas sin valores repetidos", 
        puntos_base: 5 
    },
    { 
        id: 6, 
        nombre: "Luces Medias", 
        descripcion: "Conjuntos de 3 y 4", 
        puntos_base: 2 
    },
    { 
        id: 7, 
        nombre: "Escalera Valor", 
        descripcion: "Conjuntos de cada valor (1-6)", 
        puntos_base: 5 
    },
    { 
        id: 8, 
        nombre: "Luces Fuertes", 
        descripcion: "Conjuntos de 5 y 6", 
        puntos_base: 2 
    },
    { 
        id: 9, 
        nombre: "Filas Color", 
        descripcion: "Fila sin colores repetidos", 
        puntos_base: 6 
    },
    { 
        id: 10, 
        nombre: "Escalera Color", 
        descripcion: "Conjuntos de cada color", 
        puntos_base: 4 
    }
];

// ============================================
// FUNCIONES DE ACCESO A DATOS (SOLO GETTERS)
// ============================================

function getObjetivoPrivadoById(id) {
    return OBJETIVOS_PRIVADOS.find(o => o.id === id) || null;
}

function getAllObjetivosPrivados() {
    return OBJETIVOS_PRIVADOS;
}

function getObjetivoPublicoById(id) {
    return OBJETIVOS_PUBLICOS.find(o => o.id === id) || null;
}

function getAllObjetivosPublicos() {
    return OBJETIVOS_PUBLICOS;
}

// ============================================
// EXPORTAR
// ============================================

window.OBJETIVOS_PRIVADOS = OBJETIVOS_PRIVADOS;
window.OBJETIVOS_PUBLICOS = OBJETIVOS_PUBLICOS;
window.getObjetivoPrivadoById = getObjetivoPrivadoById;
window.getAllObjetivosPrivados = getAllObjetivosPrivados;
window.getObjetivoPublicoById = getObjetivoPublicoById;
window.getAllObjetivosPublicos = getAllObjetivosPublicos;

console.log('✅ objetivos.js cargado - Definiciones de objetivos');