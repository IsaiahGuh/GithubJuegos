// Sistema de filtrado de juegos
const FilterSystem = {
    TEMAS_FIJOS: ['mqtt', 'local', 'dados', 'cartas'],
    currentFilter: null,
    
    getTopicsArray() {
        return this.TEMAS_FIJOS;
    },
    
    filterGames(juegos, topic) {
        if (!topic) return juegos;
        return juegos.filter(function(juego) {
            return juego.topics && juego.topics.includes(topic);
        });
    },
    
    setFilter(topic) {
        if (this.currentFilter === topic) {
            this.currentFilter = null;
        } else {
            this.currentFilter = topic;
        }
        return this.currentFilter;
    },
    
    isActive(topic) {
        return this.currentFilter === topic;
    },
    
    getCurrentFilter() {
        return this.currentFilter;
    },
    
    clearFilter() {
        this.currentFilter = null;
    }
};

// Funciones de ayuda
const FilterHelpers = {
    getTopicCount(juegos, topic) {
        return juegos.filter(function(juego) {
            return juego.topics && juego.topics.includes(topic);
        }).length;
    },
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};