Roguelike en JavaScript y Phaser

Roguelike por turnos que se juega en el navegador. Mapas generados al azar, combates contra enemigos que te persiguen y avanzas por tres niveles.

Como jugar

- Muévete con las flechas del teclado o con WASD.
- Para atacar, camina contra un enemigo.
- Los enemigos se mueven cada vez que tú actúas. Si estás lejos caminan al azar, y si te acercas te persiguen.
- Ganas al eliminar a todos los enemigos del tercer nivel. Pierdes si tu vida llega a 0.
- Para reiniciar, recarga la página (Ctrl + R).

### Qué significa cada símbolo

| Símbolo | Significado |
|---------|-------------|
| Número  | Tú con tu vida actual |
| `e`     | Enemigo |
| `#`     | Pared |
| `.`     | Suelo |

Bajo el mapa se muestra el nivel actual, tu vida y los enemigos que quedan.

Características

- Tres niveles con más enemigos en cada uno (5, 7 y 9).
- Regeneración de vida: recuperas 1 punto cada 10 turnos (máximo 5), y 2 puntos extra al pasar de nivel (Mas que nada porque era dificil sobrevivir a largo plazo).
- Mapas siempre ganables: al generar cada nivel se recorre el mapa con un flood fill desde la posición del jugador, y el suelo inalcanzable se convierte en pared. Así ningún enemigo queda encerrado.
- Panel de estado con nivel, vida y enemigos restantes.

Los valores de dificultad (vida inicial y máxima, turnos de regeneración, cantidad de niveles y enemigos) son constantes al inicio de `rl.js`, fáciles de ajustar.

Ejecutar en local

El juego carga recursos mediante peticiones, así que no funciona abriendo `index.html` directamente. Necesitas servirlo con un servidor local:

```bash
# con Node
npx serve
```
Luego abre la dirección que se muestre 

Otra opción es la extensión Live Server de Visual Studio, haciendo click derecho en index y seleccion 'Open with Live Server'.

Estructura

index.html      Página que carga el juego
phaser.min.js   Motor de juegos Phaser
rl.js           Lógica del juego


Créditos y cambios sobre el tutorial

Este proyecto parte del tutorial 'How to Make Your First Roguelike' de Envato Tuts+:
https://code.tutsplus.com/how-to-make-your-first-roguelike--gamedev-13677t

Lo que viene del tutorial: la base del juego (mapa en ASCII, actores, movimiento, combate y comportamiento básico de los enemigos).

Lo que agregué o modifiqué:
- Reestructuré el código en funciones más pequeñas ('startLevel', 'checkGameEnd', 'moveTo', 'aiAct', etc) y usé una constante 'DIRECTIONS'.
- Corregí errores de la lógica de turnos: los enemigos se atacaban entre sí, se movían dos veces por turno y quedaban dibujos 'fantasma' al redibujar.
- Agregué varios niveles, regeneración de vida y el panel de estado.
- Agregué la generación de mapas con flood fill.
- Evité que el juego siga respondiendo después de ganar o perder.

Tecnologías

- JavaScript
- [Phaser](https://phaser.io/) (motor de juegos HTML5)
- GitHub Pages para la publicación
