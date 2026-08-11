var cartaEnZoom = null;

function abrirZoom(carta, mostrarBoton) {
    if (mostrarBoton === undefined) mostrarBoton = true;
    cartaEnZoom = carta;
    var modal = document.getElementById('zoomModal');
    var content = document.getElementById('zoomContent');
    if (carta.seleccionadoPor && carta.seleccionadoPorId !== myId) {
        alert('Esta carta ya fue seleccionada por ' + carta.seleccionadoPor);
        return;
    }
    content.innerHTML = '';
    var img = document.createElement('img');
    img.src = carta.imagen;
    img.alt = 'Corredor ' + carta.numero;
    content.appendChild(img);
    var info = document.createElement('div');
    info.className = 'zoom-info';
    info.innerHTML = 'Corredor <span>#' + carta.numero + '</span>';
    content.appendChild(info);
    if (mostrarBoton && !carta.seleccionadoPor) {
        var btn = document.createElement('button');
        btn.className = 'btn-choose';
        btn.textContent = 'Escoger';
        btn.addEventListener('click', function() {
            if (cartaEnZoom && !cartaEnZoom.seleccionadoPor) {
                if (typeof window.seleccionarCarta === 'function') {
                    window.seleccionarCarta(cartaEnZoom.id);
                } else {
                    alert('Error: función de selección no disponible.');
                }
            }
            cerrarZoom();
        });
        content.appendChild(btn);
    }
    modal.style.display = 'flex';
}

function cerrarZoom() {
    document.getElementById('zoomModal').style.display = 'none';
    cartaEnZoom = null;
}

document.addEventListener('DOMContentLoaded', function() {
    var modal = document.getElementById('zoomModal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            cerrarZoom();
        }
    });
});