// ===== MODALES.JS =====
// Sistema de modales con cierre al hacer click fuera

// Función para cerrar un modal específico
function closeModalById(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        // Remover clase del body si no hay más modales abiertos
        checkAndRemoveBodyLock();
    }
}

// Función para abrir un modal específico
function openModalById(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        // Bloquear scroll del body
        document.body.classList.add('modal-open');
    }
}

// Verificar si hay algún modal abierto y remover el bloqueo si es necesario
function checkAndRemoveBodyLock() {
    const modals = document.querySelectorAll('.modal-overlay');
    let anyOpen = false;
    modals.forEach(modal => {
        if (modal.style.display === 'flex') {
            anyOpen = true;
        }
    });
    if (!anyOpen) {
        document.body.classList.remove('modal-open');
    }
}

// Configurar cierre al hacer click fuera del modal
function setupModalCloseOnOutsideClick() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        // Si tiene la clase 'no-close-on-outside', NO se cierra al hacer click fuera
        if (modal.classList.contains('no-close-on-outside')) {
            return;
        }
        
        modal.addEventListener('click', function(e) {
            // Si el click fue en el overlay (no en el contenido del modal)
            if (e.target === this) {
                closeModalById(this.id);
            }
        });
    });
}

// Configurar todos los botones de cierre
function setupModalCloseButtons() {
    // Botones con data-close-modal
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.dataset.closeModal;
            closeModalById(modalId);
        });
    });
}

// Inicializar el sistema de modales
function initModals() {
    setupModalCloseOnOutsideClick();
    setupModalCloseButtons();
    
    // Observar cambios en los modales para gestionar el bloqueo del body
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    const observer = new MutationObserver(() => {
        let anyOpen = false;
        modalOverlays.forEach(modal => {
            if (modal.style.display === 'flex') {
                anyOpen = true;
            }
        });
        if (anyOpen) {
            document.body.classList.add('modal-open');
        } else {
            checkAndRemoveBodyLock();
        }
    });
    
    modalOverlays.forEach(modal => {
        observer.observe(modal, { attributes: true, attributeFilter: ['style'] });
    });
    
    // También observar el marcador que se crea dinámicamente
    const bodyObserver = new MutationObserver(() => {
        const marcador = document.getElementById('marcadorModal');
        if (marcador && !marcador._observed) {
            marcador._observed = true;
            // Configurar cierre al hacer click fuera (el marcador SÍ se cierra)
            marcador.addEventListener('click', function(e) {
                if (e.target === this) {
                    if (typeof closeMarcador === 'function') {
                        closeMarcador();
                    } else {
                        closeModalById('marcadorModal');
                    }
                }
            });
            // Observar su estado
            const obs = new MutationObserver(() => {
                const isOpen = marcador.style.display === 'flex';
                if (isOpen) {
                    document.body.classList.add('modal-open');
                } else {
                    checkAndRemoveBodyLock();
                }
            });
            obs.observe(marcador, { attributes: true, attributeFilter: ['style'] });
        }
    });
    bodyObserver.observe(document.body, { childList: true, subtree: false });
}

// Función para cerrar el marcador (si existe)
function closeMarcadorIfOpen() {
    const marcador = document.getElementById('marcadorModal');
    if (marcador && marcador.style.display === 'flex') {
        if (typeof closeMarcador === 'function') {
            closeMarcador();
        } else {
            closeModalById('marcadorModal');
        }
    }
}

// Exportar funciones
window.closeModalById = closeModalById;
window.openModalById = openModalById;
window.initModals = initModals;
window.closeMarcadorIfOpen = closeMarcadorIfOpen;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initModals();
});