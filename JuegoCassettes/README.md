# 🎬 Cassettes - Juego de Cartas por Equipos

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 📖 Descripción

**Cassettes** es un juego de mesa interactivo diseñado para dos equipos. El juego combina elementos de trivia, actuación, dibujo y música en una experiencia dinámica y competitiva. Cada equipo debe completar diferentes categorías de cartas antes que el oponente para ganar.

---

## 🎯 Características Principales

- **2 Equipos**: Equipo A y Equipo B compiten en tiempo real
- **3 Modalidades por Equipo**: Frase, Mímica/Tarareo y Dibujo
- **Sistema de Desafíos**: Rondas especiales que otorgan ventajas
- **Temporizadores**: Control de tiempo por equipo para mantener el ritmo
- **Sistema de Extras**: Canjea cartas repetidas por nuevas categorías
- **Interfaz Responsive**: Funciona en desktop, tablet y móvil

---

## 🃏 Cartas y Categorías

### Cartas de Juego (Mazo Normal)

**🎬 Películas (9 categorías)**
- Acción, Romance, Ciencia Ficción, Drama, Comedia
- Animadas, Ecuatorianas, Musicales, Terror

**📺 Series (6 categorías)**
- TV, Reality, Drama, Sitcoms, Animadas, Anime

**🎵 Música (7 categorías)**
- Rock, Pop, Hip-Hop, Balada, Reguetón
- Ecuatorianas, Misceláneas

### Cartas de Desafío
- 25 cartas con imágenes sin texto
- Se utilizan en rondas especiales
- Otorgan ventajas de tiempo al ganador

---

## ⏱️ Sistema de Tiempo

| Característica | Descripción |
|----------------|-------------|
| Temporizador por Equipo | Cada equipo tiene su propio cronómetro |
| Bonus de Tiempo | +10 segundos al completar una carta |
| Ventaja de Desafío | Ganador: 60s vs Perdedor: 30s |

---

## 🏆 Sistema de Puntuación

### Condiciones de Victoria
- Completar **3 categorías de Películas**
- Completar **3 categorías de Series**
- Completar **3 categorías de Música**

### Sistema de Extras
- Al repetir una categoría ya completada, se acumulan "extras"
- Con **3 extras** de una categoría, se puede canjear por una nueva categoría

---

## 🎲 Reglas del Juego

### Fase 1: Ronda de Desafío
1. Se revela una carta de desafío
2. El temporizador inicia en 10 segundos
3. Los equipos presionan el botón para cambiar el turno
4. El equipo que no presione antes de que termine el tiempo pierde
5. El ganador obtiene ventaja de tiempo (60s vs 30s)

### Fase 2: Juego Principal
1. **Turno Activo**: El equipo en turno tiene el control
2. **Colocar Cartas**: Seleccionar una carta y colocarla en una celda vacía
3. **Completar Cartas**: Completar la carta para ganar la categoría
4. **Bonus de Tiempo**: +10 segundos al completar una carta

### Fase 3: Gestión de Categorías
- **Completar Categorías**: Al colocar una carta, se marca la categoría
- **Acumular Extras**: Las cartas repetidas generan extras
- **Canjear Extras**: 3 extras = 1 nueva categoría de elección

---

## 🛠️ Instalación y Configuración

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a Internet (para cargar imágenes)

### Estructura de Archivos

```
/
├── index.html
├── style.css
├── favicon.png
├── js/
│   ├── main.js
│   ├── desafio.js
│   ├── tablero.js
│   ├── tiempos.js
│   └── ui.js
└── imagenes/
    ├── desafios/
    │   └── desafio1.png - desafio25.png
    ├── peliculas/
    │   └── accion1.png - terror10.png
    ├── series/
    │   └── tv1.png - anime10.png
    ├── musica/
    │   └── rock1.png - miscelaneas20.png
    └── reverso.png
```

### Configuración de Imágenes

**Películas (10 imágenes cada una):**
- accion1.png a accion10.png
- romance1.png a romance10.png
- ficcion1.png a ficcion10.png
- drama1.png a drama10.png
- comedia1.png a comedia10.png
- animadas1.png a animadas10.png
- ecuatorianas1.png a ecuatorianas10.png
- musicales1.png a musicales10.png
- terror1.png a terror10.png

**Series (10 imágenes cada una):**
- tv1.png a tv10.png
- reality1.png a reality10.png
- drama1.png a drama10.png
- sitcoms1.png a sitcoms10.png
- animadas1.png a animadas10.png
- anime1.png a anime10.png

**Música:**
- rock1.png a rock10.png
- pop1.png a pop10.png
- hiphop1.png a hiphop10.png
- balada1.png a balada10.png
- regueton1.png a regueton10.png
- ecuatorianas1.png a ecuatorianas10.png
- miscelaneas1.png a miscelaneas20.png (20 imágenes)

---

## 🎮 Guía de Uso

### Controles Principales

| Elemento | Función |
|----------|---------|
| Equipo A/B | Botones para activar el turno del equipo |
| Temporizadores | Muestran el tiempo restante del equipo |
| Ocultar/Mostrar Cartas | Oculta o muestra las cartas en pantalla |
| Reinicio | Mantén presionado para reiniciar el juego |
| Nueva Ronda | Inicia una nueva ronda de desafío |
| Completar | Marca una carta como completada |

### Interacciones del Usuario

1. **Seleccionar Carta**: Haz clic en una carta del área de opciones
2. **Colocar Carta**: Elige una celda disponible en el tablero
3. **Completar Carta**: Haz clic en "Completar" en la celda correspondiente
4. **Ver Historial**: Haz clic en "Desafíos" o "Cartas" en el marcador
5. **Zoom**: Haz clic en cualquier imagen para ampliarla

### Flujo de Juego Típico

```
1. Inicio → Ronda de Desafío
2. Ganador del Desafío → Obtiene ventaja de tiempo
3. Activar Turno → Presionar botón del equipo
4. Seleccionar Carta → Elegir del mazo visible
5. Colocar en Celda → Escoger ubicación en el tablero
6. Completar Carta → Validar y ganar puntos
7. Repetir hasta completar todas las categorías
```

---

## 🎨 Personalización

### Cambiar Colores del Tema
Edita las variables CSS en `style.css`:

```css
:root {
    --color-primary: #3ca081;
    --color-secondary: #b1302b;
    --color-accent: #f5deb2;
}
```

### Modificar Mazos
En `main.js`, ajusta las categorías o cantidades:

```javascript
const categoriasDisponibles = {
    peliculas: ["Accion", "Romance", "Ficcion"],
    series: ["Tv", "Reality", "Drama"],
    musica: ["Rock", "Pop", "Hiphop"]
};
```

---

**¡Diviértete jugando Cassettes!** 🎉