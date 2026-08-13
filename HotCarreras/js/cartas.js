// js/cartas.js - Definición de cartas con texto
export function getCartasConTexto() {
    const cartas = [];

    function agregarCarta(color, imagen, textoConfig) {
        cartas.push({
            nombre: color,
            imagen: imagen,
            ...textoConfig
        });
    }

    // Colores base: Rosa, Verde, Naranja, Morado
    const coloresBase = ['Rosa', 'Verde', 'Naranja', 'Morado'];
    const textosBase = [
        { grande: '1', pequeno: 'Levantar' },
        { grande: '2', pequeno: 'Levantar' },
        { grande: 'Caer' },
        { grande: 'Girar' },
        { grande: '3' },
        { grande: '2' },
        { grande: '-2' },
        { grande: '★' },
        { grande: '1', pequeno: 'Desviar a la Derecha' },
        { grande: '1', pequeno: 'Desviar a la Izquierda' },
        { grande: '2', pequeno: 'Desviar a la Derecha' },
        { grande: '2', pequeno: 'Desviar a la Izquierda' },
        { grande: '3', pequeno: 'Desviar a la Derecha' },
        { grande: '3', pequeno: 'Desviar a la Izquierda' }
    ];

    for (const color of coloresBase) {
        for (const txt of textosBase) {
            agregarCarta(color, `${color}.png`, txt);
        }
    }

    // Azul - todas tienen "Todos" arriba
    const azulTextos = [
        // Levantar y luego 2
        { superior: 'Todos', grande: '2', pequeno: 'Levantar' },
        // Levantar y luego 3
        { superior: 'Todos', grande: '3', pequeno: 'Levantar' },
        // 1 x2 (aparece 2 veces)
        { superior: 'Todos', grande: '1', pequeno: 'Desviar a la Derecha' },
        { superior: 'Todos', grande: '1', pequeno: 'Desviar a la Izquierda' },
        // 2 x2 (aparece 2 veces)
        { superior: 'Todos', grande: '2', pequeno: 'Desviar a la Derecha' },
        { superior: 'Todos', grande: '2', pequeno: 'Desviar a la Izquierda' },
        // 3 x2 (aparece 2 veces)
        { superior: 'Todos', grande: '3', pequeno: 'Desviar a la Derecha' },
        { superior: 'Todos', grande: '3', pequeno: 'Desviar a la Izquierda' },
        // -2 x2 (aparece 2 veces)
        { superior: 'Todos', grande: '-2', pequeno: 'Desviar a la Derecha' },
        { superior: 'Todos', grande: '-2', pequeno: 'Desviar a la Izquierda' }
    ];
    for (const txt of azulTextos) {
        agregarCarta('Azul', 'Azul.png', txt);
    }

    // Negra (sin texto) - 4 cartas
    for (let i = 0; i < 4; i++) {
        agregarCarta('Negra', 'Negro.png', {});
    }

    return cartas;
}