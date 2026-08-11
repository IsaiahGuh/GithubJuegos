// js/ui/modales.js

// ========== GESTION DE MODALES ==========

var scrollPosition = 0;

function guardarScrollPosition() {
    scrollPosition = window.scrollY;
}

function restaurarScrollPosition() {
    setTimeout(function() {
        window.scrollTo(0, scrollPosition);
    }, 10);
}

function abrirModal(modal) {
    guardarScrollPosition();
    modal.style.display = "flex";
    document.body.classList.add("modal-open");
}

function cerrarModal(modal) {
    modal.style.display = "none";
    document.body.classList.remove("modal-open");
    restaurarScrollPosition();
}

// ========== MENSAJE ==========
function mostrarMensaje(titulo, texto) {
    var tituloEl = document.getElementById("mensajeTitulo");
    var textoEl = document.getElementById("mensajeTexto");
    
    if (tituloEl) tituloEl.textContent = titulo;
    if (textoEl) textoEl.textContent = texto;
    
    var modal = document.getElementById("modalMensaje");
    if (modal) {
        abrirModal(modal);
    }
}

// ========== ZOOM ==========
function cerrarZoom() {
    var modal = document.getElementById("modalZoom");
    if (modal) cerrarModal(modal);
}

// ========== HISTORIAL ==========
function mostrarHistorialFiltrado(equipo, tipo) {
    var titulo = document.getElementById("modalHistorialTitulo");
    var lista = document.getElementById("historialLista");
    if (!titulo || !lista) return;
    
    lista.innerHTML = "";
    
    if (tipo === 'desafio') {
        titulo.textContent = "Equipo " + equipo + " - Desafios Ganados";
        var desafiosEquipo = window.estadoJuego.desafiosGanadosLista.filter(function(d) { return d.equipo === equipo; });
        
        if (desafiosEquipo.length === 0) {
            lista.innerHTML = "<p style='text-align:center; color:#f5deb2; opacity:0.7;'>Sin desafios ganados</p>";
        } else {
            desafiosEquipo.forEach(function(desafio) {
                var item = document.createElement("div");
                item.className = "historial-item historial-item-desafio";
                item.innerHTML = 
                    '<img class="historial-imagen" src="imagenes/' + desafio.imagen + '" alt="Carta Desafio">' +
                    '<div class="historial-info"><small>' + desafio.fecha + '</small></div>';
                lista.appendChild(item);
            });
        }
    } else if (tipo === 'carta') {
        titulo.textContent = "Equipo " + equipo + " - Progreso de Categorias";
        
        var data = window.getEquipoData(equipo);
        var categorias = data.categorias;
        var extras = data.extras;
        
        var secciones = [
            { tipo: 'peliculas', label: '🎬 Peliculas', meta: '3/9', categorias: window.CATEGORIAS.peliculas },
            { tipo: 'series', label: '📺 Series', meta: '3/6', categorias: window.CATEGORIAS.series },
            { tipo: 'musica', label: '🎵 Musica', meta: '3/7', categorias: window.CATEGORIAS.musica }
        ];
        
        secciones.forEach(function(sec) {
            var sectionDiv = document.createElement("div");
            sectionDiv.className = "seccion-categorias";
            sectionDiv.innerHTML = '<div class="seccion-titulo">' + sec.label + ' (' + sec.meta + ' necesarias)</div>';
            
            sec.categorias.forEach(function(cat) {
                var completada = categorias.some(function(c) { return c.tipo === sec.tipo && c.categoria === cat; });
                var key = sec.tipo + "_" + cat;
                var extraCount = extras[key] || 0;
                
                var catDiv = document.createElement("div");
                catDiv.className = "historial-item";
                catDiv.style.borderLeftColor = completada ? "#3ca081" : "#f5deb2";
                catDiv.innerHTML = 
                    '<div class="historial-info">' +
                        '<strong class="' + (completada ? 'categoria-completada' : 'categoria-pendiente') + '">' + cat + (completada ? ' ✓' : '') + '</strong>' +
                        '<div class="extras-info">Extras: ' + extraCount + '</div>' +
                    '</div>';
                
                if (!completada && extraCount >= 3) {
                    var btnCanje = document.createElement("button");
                    btnCanje.textContent = "Canjear 3 extras";
                    btnCanje.className = "btn-canje";
                    btnCanje.addEventListener("click", function() {
                        cerrarModal(document.getElementById("modalHistorial"));
                        if (window.abrirModalCanje) window.abrirModalCanje(equipo, cat, sec.tipo);
                    });
                    catDiv.appendChild(btnCanje);
                }
                
                sectionDiv.appendChild(catDiv);
            });
            lista.appendChild(sectionDiv);
        });
    }
    
    var modal = document.getElementById("modalHistorial");
    if (modal) abrirModal(modal);
}

// ========== CANJE ==========
function abrirModalCanje(equipo, categoriaOrigen, tipoOrigen) {
    var titulo = document.getElementById("canjeTitulo");
    var lista = document.getElementById("canjeLista");
    if (!titulo || !lista) return;
    
    lista.innerHTML = "";
    
    titulo.textContent = "Canjea 3 extras de " + categoriaOrigen + " por una nueva categoria";
    
    var data = window.getEquipoData(equipo);
    var categorias = data.categorias;
    
    var tipos = [
        { tipo: 'peliculas', label: '🎬 Peliculas', categorias: window.CATEGORIAS.peliculas },
        { tipo: 'series', label: '📺 Series', categorias: window.CATEGORIAS.series },
        { tipo: 'musica', label: '🎵 Musica', categorias: window.CATEGORIAS.musica }
    ];
    
    tipos.forEach(function(tipo) {
        var titleDiv = document.createElement("div");
        titleDiv.className = "seccion-titulo";
        titleDiv.textContent = tipo.label;
        lista.appendChild(titleDiv);
        
        tipo.categorias.forEach(function(cat) {
            var yaCompletada = categorias.some(function(c) { return c.tipo === tipo.tipo && c.categoria === cat; });
            if (yaCompletada) return;
            
            var btn = document.createElement("div");
            btn.className = "canje-categoria";
            btn.innerHTML = cat + '<span class="canje-tipo">' + tipo.tipo + '</span>';
            btn.addEventListener("click", function() {
                if (window.realizarCanje) {
                    window.realizarCanje(equipo, categoriaOrigen, tipoOrigen, cat, tipo.tipo);
                }
            });
            lista.appendChild(btn);
        });
    });
    
    var modal = document.getElementById("modalCanje");
    if (modal) abrirModal(modal);
}

// ===== ASIGNAR AL SCOPE GLOBAL =====
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.cerrarZoom = cerrarZoom;
window.mostrarMensaje = mostrarMensaje;
window.mostrarHistorialFiltrado = mostrarHistorialFiltrado;
window.abrirModalCanje = abrirModalCanje;