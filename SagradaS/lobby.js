// ===== LOBBY.JS =====
// Control del lobby

function showJoinModal() {
    closeModalById('lobbyModal');
    openModalById('joinModal');
    
    const roomInput = document.getElementById('roomCodeInput');
    if (roomInput) {
        roomInput.value = '';
        roomInput.readOnly = false;
        roomInput.style.opacity = '1';
        roomInput.style.color = 'white';
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

window.showJoinModal = showJoinModal;
window.backToLobby = backToLobby;