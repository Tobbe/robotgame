var robot;
var now;
var deltaTime;
var last = timestamp();

/**
 * First position
 * 1 = Open top
 * 2 = Open right
 * 4 = Open down
 * 8 = Open left
 *
 * Second position
 * A = Start position
 * B = Button
 * C = Chest
 * D = Red Door
 * E = Green Door
 * F = Blue Door
 */
var levels = [{}, {}];
levels[0].field = [
    ['6-', 'E-', 'E-', 'E-', 'E-', 'C-'],
    ['7-', 'F-', 'F-', 'F-', 'F-', 'D-'],
    ['7-', 'F-', 'FA', 'FB', 'F-', 'D-'],
    ['7-', 'F-', 'F-', 'F-', 'F-', 'D-'],
    ['7-', 'F-', 'F-', 'F-', 'F-', 'D-'],
    ['3-', 'B-', 'B-', 'B-', 'B-', '9-']];
levels[0].items = [[], [], [], [], [], []];
levels[0].items[2][3] = {
        key: 'buttons',
        index: '0'
    };
levels[0].leds = [{on: false}];
levels[0].buttons = [{
        controlls: {
            key: 'leds',
            index: 0
        }
    }];
levels[1].field = [
    ['4-', '0-', '6-', 'AD', 'C-', '0-'],
    ['3B', 'AC', 'F-', 'AE', 'F-', 'C-'],
    ['0-', '0-', '3-', 'AF', '9-', '5-'],
    ['0-', '0-', '0-', '0-', '0-', '5-'],
    ['0-', '0-', '0-', '0-', '0-', '5-'],
    ['0-', '0-', '0-', '0-', '0-', '1B']];
levels[1].items = [[], [], [], [], [], []];
levels[1].items[1][0] = {
        key: 'buttons',
        index: '0'
    };
levels[1].items[5][5] = {
        key: 'buttons',
        index: '1'
    };
levels[1].leds = [{on: false}, {on: false}];
levels[1].buttons = [{
        controlls: {
            key: 'leds',
            index: 0
        }
    }, {
        controlls: {
            key: 'leds',
            index: 1
        }
    }];
var currentLevel = -1;

var gameState = 'MENU';

$(function () {
    attachClickHandlers();
    drawGameMenu();
    createPlayer();
    requestAnimationFrame(frame);
});

function getStartPosition() {
    for (var y = 0; y < levels[currentLevel].field.length; y++) {
        for (var x = 0; x < levels[currentLevel].field[y].length; x++) {
            if (levels[currentLevel].field[y][x][1] === 'A') {
                return {x: x, y: y};
            }
        }
    }

    return {x: 0, y: 0};
}

function drawGameMenu() {
    var context = $('.game_menu')[0].getContext('2d');
    var img = new Image();

    img.onload = function () {
        context.drawImage(img, 0, 0);
    };

    img.src = "game_menu.png";
}

function drawPlayingField() {
    function drawLEDs(ledCount, context, x, y) {
        for (var i = 0; i < ledCount; i++) {
            context.beginPath();
            context.arc(x - i * 24, y, 10, 2 * Math.PI, false);
            if (levels[currentLevel].leds[ledCount - 1 - i].on) {
                context.fillStyle = 'yellow';
            } else {
                context.fillStyle = 'white';
            }
            context.fill();
            context.strokeStyle = '#cfcf32';
            context.stroke();
        }
    }

    function drawTile(context, tile, x, y) {
        function drawItem(item, x, y) {
            var imgStr = '<img src="' + item + '.png" class="field_item"></img>';
            var itemElement = $(imgStr);
            itemElement.css('top', y + 10);
            itemElement.css('left', x + 10);
            $('.game_area').append(itemElement);
        }

        var tileOpenings = parseInt(tile[0], 16);

        if (tileOpenings === 0) {
            context.fillStyle = '#ccc';
        } else {
            context.fillStyle = 'white';
        }

        context.strokeStyle = 'black';

        context.beginPath();
        context.rect(x, y, 68, 68);
        context.fill();
        context.stroke();

        context.beginPath();
        context.strokeStyle = 'white';

        if (tileOpenings & 1) {
            context.moveTo(x + 4, y);
            context.lineTo(x + 64, y);
        }

        if (tileOpenings & 2) {
            context.moveTo(x + 68, y + 4);
            context.lineTo(x + 68, y + 64);
        }

        if (tileOpenings & 4) {
            context.moveTo(x + 4, y + 68);
            context.lineTo(x + 64, y + 68);
        }

        if (tileOpenings & 8) {
            context.moveTo(x, y + 4);
            context.lineTo(x, y + 64);
        }

        if (tile[1] === 'B') {
            drawItem('button', x, y);
        }

        if (tile[1] === 'C') {
            drawItem('chest', x, y);
        }

        if (tile[1] === 'D') {
            drawItem('door_red', x, y);
        }

        if (tile[1] === 'E') {
            drawItem('door_green', x, y);
        }

        if (tile[1] === 'F') {
            drawItem('door_blue', x, y);
        }

        context.stroke();
    }

    var context = $('.field')[0].getContext('2d');
    context.lineWidth = 2;

    levels[currentLevel].field.forEach(function (line, lineIndex) {
        line.forEach(function (tile, tileIndex) {
            drawTile(context, tile, tileIndex * 68 + 1, lineIndex * 68 + 1);
        });
    });

    var statusAreaY = levels[currentLevel].field.length * 68 + 10;
    var statusAreaX = levels[currentLevel].field[0].length * 68;
    drawLEDs(levels[currentLevel].leds.length, context, statusAreaX - 12, statusAreaY + 12);
}

function createPlayer(startCoordinates) {
    robot = $('<img src="robot.png" class="player">');
    robot.css('top', 6);
    robot.css('left', 6);
    robot.dx = 0;
    robot.dy = 0;
    robot.x = 0;
    robot.y = 0;
    robot.speed = 2;
    robot.currentTileCoords = function () {
        return {
            x: robot.x / 100 | 0,
            y: robot.y / 100 | 0
        };
    };
    $('.game_area').append(robot);
}

function setPlayerPosition(coords) {
    robot.css('top', 6 + coords.y * 68);
    robot.css('left', 6 + coords.x * 68);
    robot.x = coords.x * 100;
    robot.y = coords.y * 100;
}

function attachClickHandlers() {
    $('input').on('click', function() {
        robot.currentInstruction = nextInstruction();
        robot.instructionCompleted = false;
    });

    $('.game_menu').on('click', function() {
        changeGameState();
    });
}

function changeGameState() {
    if (gameState === 'MENU') {
        delete nextInstruction.instructionArray;
        currentLevel++;
        drawPlayingField();
        setPlayerPosition(getStartPosition());
        $('.game_menu').hide();
        gameState = 'GAME';
    } else {
        $('.game_menu').show();
        robot.currentInstruction = 'wait';
        robot.instructionCompleted = false;
        gameState = 'MENU';
    }
}

function timestamp() {
    return window.performance && window.performance.now ?
        window.performance.now() :
        new Date().getTime();
}

function nextInstruction() {
    if (!nextInstruction.instructionArray) {
        var script = $('textarea').val();
        var lines = script.split('\n');
        nextInstruction.instructionArray = [];

        lines.forEach(function (line) {
            // A line will look something like `robot.moveDown(3);` or
            // `robot.pushButton()`

            var instructionName = line.substring(6, line.indexOf('('));

            if (instructionName.indexOf('move') === 0) {
                var direction = line.substring(10, line.indexOf('(')).toLowerCase();
                var repetitions = line.substr(line.indexOf('(') + 1, 1);
                for (var i = 0; i < repetitions; i++) {
                    nextInstruction.instructionArray.push(direction);
                }
            } else if (instructionName === 'pushButton') {
                nextInstruction.instructionArray.push('pushButton');
            } else if (instructionName === 'openChest') {
                nextInstruction.instructionArray.push('openChest');
            } else if (instructionName === 'openDoor') {
                nextInstruction.instructionArray.push('openDoor');
            }
        });
    }

    return nextInstruction.instructionArray.shift();
}

function update(deltaTime) {
    function levelCompleted() {
        for (var i = 0; i < levels[currentLevel].leds.length; i++) {
            if (!levels[currentLevel].leds[i].on) {
                return false;
            }
        }

        return true;
    }

    function move() {
        robot.x += robot.dx * robot.speed;
        robot.y += robot.dy * robot.speed;

        if (robot.x % 100 === 0 && robot.y % 100 === 0) {
            robot.dx = 0;
            robot.dy = 0;
            robot.instructionCompleted = true;
        }
    }

    var tileCoords = robot.currentTileCoords();

    switch (robot.currentInstruction) {
        case 'right':
            robot.dx = 1;
            move();
            break;
        case 'left':
            robot.dx = -1;
            move();
            break;
        case 'down':
            robot.dy = 1;
            move();
            break;
        case 'up':
            robot.dy = -1;
            move();
            break;
        case 'pushButton':
            var item = levels[currentLevel].items[tileCoords.y][tileCoords.x];
            if (item.key === 'buttons') {
                var button = levels[currentLevel].buttons[item.index];
                var controlledItem = levels[currentLevel][button.controlls.key][button.controlls.index];
                controlledItem.on = !controlledItem.on;
                drawPlayingField();
            }
            robot.instructionCompleted = true;
            break;
        case 'openChest':
            var keys = ['red', 'green', 'blue'];
            var foundKey = keys[Math.floor(Math.random() * keys.length)];
            robot.key = foundKey;
            console.log('You collected a ' + foundKey + ' key!');
            robot.instructionCompleted = true;
            break;
        case 'openDoor':
            var tile = levels[currentLevel].field[tileCoords.y][tileCoords.x];

            if (tile[1] === 'D' && robot.key === 'red') {
                console.log('open door');
            } else if (tile[1] === 'E' && robot.key === 'green') {
                console.log('open door');
            } else if (tile[1] === 'F' && robot.key === 'blue') {
                console.log('open door');
            }

            robot.instructionCompleted = true;
            break;
    }

    if (robot.instructionCompleted) {
        robot.currentInstruction = undefined;

        if (!robot.pause) {
            robot.pause = 500;
        }

        robot.pause -= deltaTime;

        if (robot.pause <= 0) {
            delete robot.pause;

            if (levelCompleted()) {
                changeGameState();
            } else {
                robot.currentInstruction = nextInstruction();
                robot.instructionCompleted = false;
            }
        }
    }
}

function render() {
    // The robot takes 100 steps when moving from one map tile to the next
    // Each map tile is 68 x 68 pixels
    // So each robot step is 68/100 pixels
    robot.css('left', 6 + Math.round(robot.x * 68 / 100));
    robot.css('top', 6 + Math.round(robot.y * 68 / 100));
}

function frame() {
    now = timestamp();
    deltaTime = now - last;

    if (gameState === 'GAME') {
        update(deltaTime);
        render(deltaTime);
    }

    last = now;

    requestAnimationFrame(frame);
}
