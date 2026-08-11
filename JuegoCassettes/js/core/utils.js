// js/core/utils.js

function mezclarCartas(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function getCeldasInfo() {
    return [
        { id: 0, equipo: 'A', categoria: "frase", nombre: "Frase" },
        { id: 1, equipo: 'A', categoria: "mimica", nombre: "Mimica/Tarareo" },
        { id: 2, equipo: 'A', categoria: "dibujo", nombre: "Dibujo" },
        { id: 3, equipo: 'B', categoria: "frase", nombre: "Frase" },
        { id: 4, equipo: 'B', categoria: "mimica", nombre: "Mimica/Tarareo" },
        { id: 5, equipo: 'B', categoria: "dibujo", nombre: "Dibujo" }
    ];
}

function getCeldasEquipo(equipo) {
    var celdas = getCeldasInfo();
    return celdas.filter(function(c) { return c.equipo === equipo; });
}

// ===== ASIGNAR AL SCOPE GLOBAL =====
window.mezclarCartas = mezclarCartas;
window.getCeldasInfo = getCeldasInfo;
window.getCeldasEquipo = getCeldasEquipo;