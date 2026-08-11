// ===== LOBBY.JS =====
// Control del lobby

const urlParams = new URLSearchParams(window.location.search);
const isAutoMode = urlParams.get('auto') === '1';
const AUTO_ROOM_CODE = 'GRIL';

function playSolo() {
    closeModalById('lobbyModal');
    
    if (typeof generarObjetivosYHerramientas === 'function') {
        generarObjetivosYHerramientas();
    }
    
    if (typeof iniciarJuego === 'function') {
        iniciarJuego();
    } else {
        const allCards = [...CARTILLAS];
        const shuffledCards = allCards.sort(() => Math.random() - 0.5);
        const playerCards = shuffledCards.slice(0, 4);
        window.gameState.availableCards = playerCards;
        if (typeof showInitialCardSelector === 'function') {
            showInitialCardSelector(playerCards);
        }
    }
}

function showJoinModal() {
    closeModalById('lobbyModal');
    openModalById('joinModal');
    
    if (isAutoMode) {
        const roomInput = document.getElementById('roomCodeInput');
        if (roomInput) {
            roomInput.value = AUTO_ROOM_CODE;
            roomInput.readOnly = true;
            roomInput.style.opacity = '0.7';
            roomInput.style.color = '#4CAF50';
        }
    } else {
        const roomInput = document.getElementById('roomCodeInput');
        if (roomInput) {
            roomInput.value = '';
            roomInput.readOnly = false;
            roomInput.style.opacity = '1';
            roomInput.style.color = 'white';
        }
    }
}

function backToLobby() {
    closeModalById('joinModal');
    openModalById('lobbyModal');
}

// Configurar eventos
document.addEventListener('DOMContentLoaded', function() {
    const createRoomBtn = document.getElementById('createRoomBtn');
    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', createRoom);
    }
    
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    if (joinRoomBtn) {
        joinRoomBtn.addEventListener('click', showJoinModal);
    }
    
    const playSoloBtn = document.getElementById('playSoloBtn');
    if (playSoloBtn) {
        playSoloBtn.addEventListener('click', playSolo);
    }
    
    const backToLobbyBtn = document.getElementById('backToLobbyBtn');
    if (backToLobbyBtn) {
        backToLobbyBtn.addEventListener('click', backToLobby);
    }
    
    const enterRoomBtn = document.getElementById('enterRoomBtn');
    if (enterRoomBtn) {
        enterRoomBtn.addEventListener('click', joinRoom);
    }
    
    const roomCodeInput = document.getElementById('roomCodeInput');
    if (roomCodeInput) {
        roomCodeInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                joinRoom();
            }
        });
    }
});

window.playSolo = playSolo;
window.showJoinModal = showJoinModal;
window.backToLobby = backToLobby;
window.AUTO_ROOM_CODE = AUTO_ROOM_CODE;