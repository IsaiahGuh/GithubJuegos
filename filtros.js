// Sistema de filtrado de juegos
const FilterSystem = {
    currentFilter: null,
    allTopics: new Set(),
    
    extractTopics(juegos) {
        this.allTopics = new Set();
        juegos.forEach(juego => {
            if (juego.topics) {
                juego.topics.forEach(topic => this.allTopics.add(topic));
            }
        });
        return this.allTopics;
    },
    
    getTopicsArray() {
        return Array.from(this.allTopics).sort();
    },
    
    filterGames(juegos, topic) {
        if (!topic) return juegos;
        return juegos.filter(juego => 
            juego.topics && juego.topics.includes(topic)
        );
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

// Funciones de ayuda para filtros
const FilterHelpers = {
    getTopicCount(juegos, topic) {
        return juegos.filter(juego => 
            juego.topics && juego.topics.includes(topic)
        ).length;
    },
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};