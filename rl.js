// configuración
var FONT = 32;          // tamaño de fuente
var ROWS = 10;          // alto del mapa
var COLS = 15;          // ancho del mapa
var HUD_HEIGHT = 24;    // espacio bajo el mapa para mostrar nivel y vida
var DIRECTIONS = [
    { x: -1, y: 0 },    // izquierda
    { x: 1, y: 0 },     // derecha
    { x: 0, y: -1 },    // arriba
    { x: 0, y: 1 }      // abajo
];

// progresión y vida
var TOTAL_LEVELS = 3;   // niveles para ganar
var START_HP = 3;       // vida inicial del jugador
var MAX_HP = 5;         // vida máxima
var REGEN_TURNS = 10;    // cada cuántos turnos se recupera 1 de vida
var HEAL_ON_LEVEL = 2;  // vida que se recupera al pasar de nivel
var MIN_FREE_TILES = 20; // casillas libres extra que debe tener la zona alcanzable


// estado del juego
var map;                // mapa matriz de '#' y '.'
var asciidisplay;       // matriz de textos de Phaser, una celda por casilla
var hud;                // texto con nivel, vida y enemigos
var player;             // jugador
var actorList;          // todos los actores; los muertos quedan en null
var actorMap;           // actor por posición y_x
var livingEnemies;      // enemigos que quedan vivos
var level = 1;          // nivel actual
var turnsSinceRegen = 0;
var gameEnded = false;

// iniciar
var game = new Phaser.Game(COLS * FONT * 0.6, ROWS * FONT + HUD_HEIGHT, Phaser.AUTO, null, {
    create: create
});

function create() {
    game.input.keyboard.addCallbacks(null, null, onKeyUp);
    initScreen();
    initHud();
    startLevel(START_HP);
}

function randomInt(max) {
    return Math.floor(Math.random() * max);
}

// cantidad de enemigos según el nivel: 5, 7, 9...
function enemiesForLevel(lvl) {
    return 3 + lvl * 2;
}

// prepara un nivel nuevo conservando la vida que se le pase al jugador
function startLevel(playerHp) {
    var needed = enemiesForLevel(level) + 1 + MIN_FREE_TILES;
    var start;
    // repetir hasta tener un mapa con zona alcanzable suficientemente grande
    do {
        initMap();
        start = randomFloor();
    } while (!keepReachable(start, needed));

    initActors(playerHp, start);
    drawMap();
    drawActors();
    updateHud();
}

function nextLevel() {
    level++;
    turnsSinceRegen = 0;
    var hp = Math.min(MAX_HP, player.hp + HEAL_ON_LEVEL);
    startLevel(hp);
    showBanner('Nivel ' + level, '#ee2', 1000);
}

function initMap() {
    // mapa aleatorio, 20% de paredes
    map = [];
    for (var y = 0; y < ROWS; y++) {
        var row = [];
        for (var x = 0; x < COLS; x++)
            row.push(Math.random() > 0.8 ? '#' : '.');
        map.push(row);
    }
}

// devuelve una casilla de suelo al azar
function randomFloor() {
    var x, y;
    do {
        y = randomInt(ROWS);
        x = randomInt(COLS);
    } while (map[y][x] == '#');
    return { x: x, y: y };
}

// recorre el mapa desde 'start' (flood fill) y convierte en pared el suelo
// que no se puede alcanzar. Devuelve false si la zona alcanzable es muy pequeña.
function keepReachable(start, needed) {
    var visited = [];
    for (var y = 0; y < ROWS; y++) {
        var row = [];
        for (var x = 0; x < COLS; x++)
            row.push(false);
        visited.push(row);
    }

    var queue = [start];
    visited[start.y][start.x] = true;
    var count = 0;
    while (queue.length > 0) {
        var cell = queue.shift();
        count++;
        for (var d = 0; d < DIRECTIONS.length; d++) {
            var nx = cell.x + DIRECTIONS[d].x;
            var ny = cell.y + DIRECTIONS[d].y;
            if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS &&
                !visited[ny][nx] && map[ny][nx] == '.') {
                visited[ny][nx] = true;
                queue.push({ x: nx, y: ny });
            }
        }
    }

    if (count < needed)
        return false;

    // el suelo no visitado queda aislado: se convierte en pared
    for (var yy = 0; yy < ROWS; yy++)
        for (var xx = 0; xx < COLS; xx++)
            if (map[yy][xx] == '.' && !visited[yy][xx])
                map[yy][xx] = '#';
    return true;
}

function initScreen() {
    asciidisplay = [];
    for (var y = 0; y < ROWS; y++) {
        var row = [];
        for (var x = 0; x < COLS; x++)
            row.push(initCell('', x, y));
        asciidisplay.push(row);
    }
}

function initCell(chr, x, y) {
    var style = { font: FONT + "px monospace", fill: "#fff" };
    return game.add.text(FONT * 0.6 * x, FONT * y, chr, style);
}

function initHud() {
    var style = { font: "14px monospace", fill: "#aaa" };
    hud = game.add.text(4, ROWS * FONT + 4, '', style);
}

function updateHud() {
    hud.content = 'Nivel ' + level + '/' + TOTAL_LEVELS +
        '  Vida ' + Math.max(player.hp, 0) + '/' + MAX_HP +
        '  Enemigos ' + livingEnemies;
}

function initActors(playerHp, start) {
    actorList = [];
    actorMap = {};
    var enemies = enemiesForLevel(level);
    for (var e = 0; e <= enemies; e++) {
        var actor = { x: 0, y: 0, hp: e == 0 ? playerHp : 1 };
        if (e == 0) {
            // el jugador empieza en la casilla desde la que se validó el mapa
            actor.x = start.x;
            actor.y = start.y;
        } else {
            do {
                // posición aleatoria que sea suelo y no esté ocupada
                actor.y = randomInt(ROWS);
                actor.x = randomInt(COLS);
            } while (map[actor.y][actor.x] == '#' || actorMap[actor.y + "_" + actor.x] != null);
        }
        actorMap[actor.y + "_" + actor.x] = actor;
        actorList.push(actor);
    }
    player = actorList[0];
    livingEnemies = enemies;
}


// dibujo
function drawMap() {
    for (var y = 0; y < ROWS; y++)
        for (var x = 0; x < COLS; x++)
            asciidisplay[y][x].content = map[y][x];
}

function drawActors() {
    for (var a in actorList) {
        var actor = actorList[a];
        if (actor != null && actor.hp > 0)
            asciidisplay[actor.y][actor.x].content = (a == 0) ? '' + player.hp : 'e';
    }
}

function showMessage(text, color) {
    var message = game.add.text(game.world.centerX, game.world.centerY, text,
        { fill: color, align: "center" });
    message.anchor.setTo(0.5, 0.5);
    return message;
}

// mensaje temporal que desaparece solo
function showBanner(text, color, ms) {
    var message = showMessage(text, color);
    setTimeout(function () { message.destroy(); }, ms);
}


// turnos
function onKeyUp(event) {
    if (gameEnded)
        return;

    drawMap();

    // acción del jugador
    var acted = false;
    switch (event.keyCode) {
        case Phaser.Keyboard.LEFT:
            acted = moveTo(player, DIRECTIONS[0]);
            break;
        case Phaser.Keyboard.RIGHT:
            acted = moveTo(player, DIRECTIONS[1]);
            break;
        case Phaser.Keyboard.UP:
            acted = moveTo(player, DIRECTIONS[2]);
            break;
        case Phaser.Keyboard.DOWN:
            acted = moveTo(player, DIRECTIONS[3]);
            break;
    }

    // los enemigos actúan solo si el jugador hizo algo
    if (acted) {
        for (var i = 1; i < actorList.length; i++) {
            if (actorList[i] != null)
                aiAct(actorList[i]);
        }
        regenerate();
    }

    drawActors();
    updateHud();
    checkGameEnd();
}

// el jugador recupera 1 de vida cada REGEN_TURNS turnos, hasta MAX_HP
function regenerate() {
    if (player.hp < 1)
        return;
    turnsSinceRegen++;
    if (turnsSinceRegen >= REGEN_TURNS) {
        turnsSinceRegen = 0;
        if (player.hp < MAX_HP)
            player.hp++;
    }
}

function checkGameEnd() {
    if (player.hp < 1) {
        gameEnded = true;
        showMessage('Game Over\nCtrl+r to restart', '#e22');
    } else if (livingEnemies == 0) {
        if (level < TOTAL_LEVELS) {
            nextLevel();
        } else {
            gameEnded = true;
            showMessage('Victory!\nCtrl+r to restart', '#2e2');
        }
    }
}

// reglas
function canGo(actor, dir) {
    return actor.x + dir.x >= 0 &&
        actor.x + dir.x <= COLS - 1 &&
        actor.y + dir.y >= 0 &&
        actor.y + dir.y <= ROWS - 1 &&
        map[actor.y + dir.y][actor.x + dir.x] == '.';
}

function moveTo(actor, dir) {
    if (!canGo(actor, dir))
        return false;

    var newKey = (actor.y + dir.y) + '_' + (actor.x + dir.x);
    var victim = actorMap[newKey];

    if (victim != null) {
        // solo se atacan jugador y enemigos
        if (actor !== player && victim !== player)
            return false;

        victim.hp--;
        if (victim.hp == 0) {
            actorMap[newKey] = null;
            actorList[actorList.indexOf(victim)] = null;
            if (victim !== player)
                livingEnemies--;
        }
    } else {
        // mover
        actorMap[actor.y + '_' + actor.x] = null;
        actor.y += dir.y;
        actor.x += dir.x;
        actorMap[actor.y + '_' + actor.x] = actor;
    }
    return true;
}

// IA de los enemigos
function aiAct(actor) {
    var dx = player.x - actor.x;
    var dy = player.y - actor.y;

    if (Math.abs(dx) + Math.abs(dy) > 6) {
        // caminar al azar
        for (var i = 0; i < 10; i++) {
            if (moveTo(actor, DIRECTIONS[randomInt(DIRECTIONS.length)]))
                break;
        }
    } else if (Math.abs(dx) > Math.abs(dy)) {
        // cerca: acercarse al jugador por el eje más largo
        moveTo(actor, dx < 0 ? DIRECTIONS[0] : DIRECTIONS[1]);
    } else {
        moveTo(actor, dy < 0 ? DIRECTIONS[2] : DIRECTIONS[3]);
    }
}