// ============================================================
// MODAL NUMÉRICO - CLEVERDADOS (CORREGIDO)
// ============================================================

let modalNumericoAbierto = false;

/**
 * Muestra un modal para seleccionar un número del 1 al 6
 * @param {Function} callback - Función que se ejecuta al seleccionar un número (recibe el número)
 * @param {string} titulo - Título del modal (opcional)
 * @param {string} subtitulo - Subtítulo del modal (opcional)
 */
function mostrarModalNumerico(callback, titulo = 'Selecciona un número', subtitulo = 'Elige del 1 al 6') {
    // Si ya hay un modal abierto, no crear otro
    if (modalNumericoAbierto) return;
    
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-numerico-overlay';
    overlay.id = 'modalNumericoOverlay';
    
    // Crear contenido del modal - SIN BOTÓN CANCELAR
    overlay.innerHTML = `
        <div class="modal-numerico-box" id="modalNumericoBox">
            <h2>${titulo}</h2>
            <p>${subtitulo}</p>
            <div class="modal-numerico-grid">
                <button class="modal-numerico-btn" data-numero="1">1</button>
                <button class="modal-numerico-btn" data-numero="2">2</button>
                <button class="modal-numerico-btn" data-numero="3">3</button>
                <button class="modal-numerico-btn" data-numero="4">4</button>
                <button class="modal-numerico-btn" data-numero="5">5</button>
                <button class="modal-numerico-btn" data-numero="6">6</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    modalNumericoAbierto = true;
    
    // Cerrar al hacer clic fuera del modal (en el overlay)
    overlay.addEventListener('click', function(e) {
        // Solo cerrar si el clic fue directamente en el overlay (no en el box ni en sus hijos)
        if (e.target === this) {
            cerrarModalNumerico();
        }
    });
    
    // Event listeners para los botones numéricos
    overlay.querySelectorAll('.modal-numerico-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            const numero = parseInt(this.dataset.numero);
            
            // Guardar referencia al callback antes de cerrar
            const callbackLocal = callback;
            
            // Cerrar el modal
            cerrarModalNumerico();
            
            // Ejecutar callback después de cerrar
            if (typeof callbackLocal === 'function') {
                setTimeout(function() {
                    callbackLocal(numero);
                }, 50);
            }
        });
    });
    
    // Evitar que el clic dentro del box cierre el modal
    const box = overlay.querySelector('#modalNumericoBox');
    if (box) {
        box.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

/**
 * Cierra el modal numérico
 */
function cerrarModalNumerico() {
    const overlay = document.getElementById('modalNumericoOverlay');
    if (overlay) {
        overlay.remove();
        modalNumericoAbierto = false;
    }
}

// ============================================================
// EXPORTAR
// ============================================================

window.mostrarModalNumerico = mostrarModalNumerico;
window.cerrarModalNumerico = cerrarModalNumerico;