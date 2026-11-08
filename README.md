Roguelike en JavaScript y Phaser

Roguelike por turnos que se juega en el navegador. Mapas generados al azar, combates contra enemigos que te persiguen y avanzas por tres niveles.

https://pointman16.github.io/roguelike-phaser/


Como jugar

- Muévete con las flechas del teclado**.
- Para atacar, camina contra un enemigo. Cada golpe le quita 1 de vida.
- Los enemigos se mueven cada vez que tú actúas. Si estás lejos caminan al azar, y si te acercas te persiguen.
- Ganas al eliminar a todos los enemigos del tercer nivel. Pierdes si tu vida llega a 0.
- Para reiniciar, recarga la página (**Ctrl + R**).

### Qué significa cada símbolo

| Símbolo | Significado |
|---------|-------------|
| Número  | Tú, con tu vida actual |
| `e`     | Enemigo |
| `#`     | Pared |
| `.`     | Suelo |

Bajo el mapa se muestra el nivel actual, tu vida y los enemigos que quedan.

## Características

- **Tres niveles** con más enemigos en cada uno (5, 7 y 9).
- **Regeneración de vida:** recuperas 1 punto cada 5 turnos (máximo 5), y 2 puntos extra al pasar de nivel.
- **Mapas siempre resolubles:** al generar cada nivel se recorre el mapa con un flood fill desde la posición del jugador, y el suelo inalcanzable se convierte en pared. Así ningún enemigo queda encerrado.
- **Panel de estado** con nivel, vida y enemigos restantes.

Los valores de dificultad (vida inicial y máxima, turnos de regeneración, cantidad de niveles y enemigos) son constantes al inicio de `rl.js`, fáciles de ajustar.

## Ejecutar en local

El juego carga recursos mediante peticiones, así que no funciona abriendo `index.html` directamente. Necesitas servirlo con un servidor local:

```bash
# con Node
npx serve

# o con Python
python -m http.server 8000
```

Luego abre la dirección que se muestre (por ejemplo, `http://localhost:8000`). Otra opción es la extensión **Live Server** de VS Code.

## Estructura

```
index.html      Página que carga el juego
phaser.min.js   Motor de juegos Phaser
rl.js           Lógica del juego
```

## Créditos y cambios sobre el tutorial

Este proyecto parte del tutorial **"How to Make Your First Roguelike"** de Envato Tuts+:
https://code.tutsplus.com/how-to-make-your-first-roguelike--gamedev-13677t

Lo que viene del tutorial: la base del juego (mapa en ASCII, actores, movimiento, combate y comportamiento básico de los enemigos).

Lo que agregué o modifiqué:
- Reestructuré el código en funciones más pequeñas (`startLevel`, `checkGameEnd`, `moveTo`, `aiAct`...) y usé una constante `DIRECTIONS` en lugar de repetir los vectores.
- Corregí errores de la lógica de turnos: los enemigos se atacaban entre sí, se movían dos veces por turno, quedaban dibujos fantasma al redibujar, y el juego fallaba al morir un actor.
- Agregué varios niveles, regeneración de vida y el panel de estado.
- Agregué la generación de mapas con garantía de alcance (flood fill).
- Evité que el juego siga respondiendo después de ganar o perder.

## Tecnologías

- JavaScript
- [Phaser](https://phaser.io/) (motor de juegos HTML5)
- GitHub Pages para la publicación

## Ideas para seguir

- Ítems y pociones
- Enemigos con distintos comportamientos
- Visión limitada (niebla de guerra)
- Puntuación y mejores marcadores