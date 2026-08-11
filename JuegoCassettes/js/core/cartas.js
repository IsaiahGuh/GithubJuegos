// js/core/cartas.js

// ========== DATOS DE CARTAS ==========

var TIPOS_CARTA = {
    peliculas: { icon: '🎬', label: 'Pelicula', victoriaNecesaria: 3 },
    series: { icon: '📺', label: 'Serie', victoriaNecesaria: 3 },
    musica: { icon: '🎵', label: 'Musica', victoriaNecesaria: 3 }
};

var CATEGORIAS = {
    peliculas: ["Accion", "Romance", "Ficcion", "Drama", "Comedia", "Animadas", "Ecuatorianas", "Musicales", "Terror"],
    series: ["Tv", "Reality", "Drama", "Sitcoms", "Animadas", "Anime"],
    musica: ["Rock", "Pop", "Hiphop", "Balada", "Regueton", "Ecuatorianas", "Miscelaneas"]
};

var CATEGORIAS_POR_TIPO = {
    peliculas: { 
        label: '🎬 Peliculas', 
        meta: '3/9', 
        categorias: CATEGORIAS.peliculas 
    },
    series: { 
        label: '📺 Series', 
        meta: '3/6', 
        categorias: CATEGORIAS.series 
    },
    musica: { 
        label: '🎵 Musica', 
        meta: '3/7', 
        categorias: CATEGORIAS.musica 
    }
};

function generarMazoDesafio() {
    var mazo = [];
    for (var i = 1; i <= 25; i++) {
        mazo.push({ imagen: "desafios/desafio" + i + ".png", texto: "" });
    }
    return mazo;
}

function generarMazoNormal() {
    var mazo = [];
    
    CATEGORIAS.peliculas.forEach(function(categoria) {
        for (var i = 1; i <= 10; i++) {
            mazo.push(crearCarta('peliculas', categoria, i));
        }
    });
    
    CATEGORIAS.series.forEach(function(categoria) {
        for (var i = 1; i <= 10; i++) {
            mazo.push(crearCarta('series', categoria, i));
        }
    });
    
    CATEGORIAS.musica.forEach(function(categoria) {
        var maxCards = categoria === "Miscelaneas" ? 20 : 10;
        for (var i = 1; i <= maxCards; i++) {
            mazo.push(crearCarta('musica', categoria, i));
        }
    });
    
    return mazo;
}

function crearCarta(tipo, categoria, numero) {
    var tipoInfo = TIPOS_CARTA[tipo];
    return {
        imagen: tipo + "/" + categoria.toLowerCase() + numero + ".png",
        tipo: tipo,
        tipoTexto: tipoInfo.icon + " " + tipoInfo.label,
        categoria: categoria,
        categoriaTexto: categoria
    };
}

function getTipoInfo(tipo) {
    return TIPOS_CARTA[tipo] || { icon: '', label: tipo || '' };
}

function getCardDisplay(carta) {
    if (!carta) return { tipoTexto: '', categoriaTexto: '' };
    var tipoInfo = getTipoInfo(carta.tipo);
    return {
        tipoTexto: carta.tipoTexto || tipoInfo.icon + " " + tipoInfo.label,
        categoriaTexto: carta.categoriaTexto || carta.categoria || ''
    };
}

// ===== ASIGNAR AL SCOPE GLOBAL =====
window.TIPOS_CARTA = TIPOS_CARTA;
window.CATEGORIAS = CATEGORIAS;
window.CATEGORIAS_POR_TIPO = CATEGORIAS_POR_TIPO;
window.generarMazoDesafio = generarMazoDesafio;
window.generarMazoNormal = generarMazoNormal;
window.getTipoInfo = getTipoInfo;
window.getCardDisplay = getCardDisplay;