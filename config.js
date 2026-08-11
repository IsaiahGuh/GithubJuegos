// Sistema de configuracion y datos del jugador
const Config = {
    DEFAULT_ROOM_CODE: 'GRIL',
    STORAGE_KEY: 'githubjuegos_lobby_data',
    
    getJuegos() {
        try {
            // Verificar si APP_CONFIG existe y tiene JUEGOS
            if (typeof window.APP_CONFIG !== 'undefined' && 
                window.APP_CONFIG && 
                window.APP_CONFIG.JUEGOS) {
                console.log('Config: Cargando juegos desde APP_CONFIG');
                return window.APP_CONFIG.JUEGOS;
            } else {
                console.warn('Config: APP_CONFIG.JUEGOS no encontrado');
                // Juegos por defecto si no hay configuracion
                return [
                    {
                        id: 'CleverDados',
                        nombre: 'CleverDados',
                        ruta: './CleverDados/index.html',
                        color: '#D44D5C',
                        topics: ['multijugador', 'dados', 'estrategia'],
                        badge: 'Online'
                    },
                    {
                        id: 'QuixxDados',
                        nombre: 'QuixxDados',
                        ruta: './QuixxDados/index.html',
                        color: '#808BC3',
                        topics: ['multijugador', 'dados', 'estrategia'],
                        badge: 'Online'
                    },
                    {
                        id: 'JuegoCassettes',
                        nombre: 'Cassettes',
                        ruta: './JuegoCassettes/index.html',
                        color: '#f5deb2',
                        topics: ['multijugador', 'cartas', 'desafios'],
                        badge: 'Online'
                    },
                    {
                        id: 'ParaDice',
                        nombre: 'ParaDice',
                        ruta: './ParaDice/index.html',
                        color: '#f5deb2',
                        topics: ['multijugador', 'cartas', 'desafios'],
                        badge: 'Online'
                    }
                ];
            }
        } catch (e) {
            console.error('Error cargando juegos:', e);
            return [];
        }
    },
    
    getDefaultRoomCode() {
        try {
            if (typeof window.APP_CONFIG !== 'undefined' && 
                window.APP_CONFIG && 
                window.APP_CONFIG.DEFAULT_ROOM_CODE) {
                return window.APP_CONFIG.DEFAULT_ROOM_CODE;
            }
        } catch (e) {}
        return this.DEFAULT_ROOM_CODE;
    }
};

// Datos del jugador
const PlayerData = {
    data: {
        nombre: '',
        codigoSala: ''
    },
    
    load() {
        try {
            const saved = localStorage.getItem(Config.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.data.nombre = parsed.nombre || '';
                this.data.codigoSala = parsed.codigoSala || Config.getDefaultRoomCode();
                return true;
            }
        } catch (e) {
            console.warn('Error cargando datos:', e);
        }
        this.data.codigoSala = Config.getDefaultRoomCode();
        return false;
    },
    
    save(nombre, codigoSala) {
        this.data.nombre = nombre.trim();
        this.data.codigoSala = codigoSala.trim().toUpperCase();
        try {
            localStorage.setItem(Config.STORAGE_KEY, JSON.stringify(this.data));
            return true;
        } catch (e) {
            console.error('Error guardando datos:', e);
            return false;
        }
    },
    
    clear() {
        this.data.nombre = '';
        this.data.codigoSala = Config.getDefaultRoomCode();
        try {
            localStorage.removeItem(Config.STORAGE_KEY);
            return true;
        } catch (e) {
            console.error('Error limpiando datos:', e);
            return false;
        }
    },
    
    getNombre() { return this.data.nombre; },
    getCodigoSala() { return this.data.codigoSala; },
    hasData() { return this.data.nombre.length > 0 && this.data.codigoSala.length >= 4; }
};

// Validacion
const Validator = {
    isValidName(name) {
        return name && name.trim().length > 0;
    },
    
    isValidRoomCode(code) {
        const clean = code.trim().toUpperCase();
        return clean.length >= 4 && /^[A-Z0-9]+$/.test(clean);
    },
    
    getCleanRoomCode(code) {
        return code.trim().toUpperCase();
    }
};