// TODO-list
// [x] Document has<Color>Key() methods
// [x] Document "if"-support
// [x] Don't walk through walls
// [x] Add openDoor() method
// [x] Don't walk through closed doors
// [x] Show "open door" graphic when door is open
// [x] Add status area
//       [x] Wall (move<Direction>)
//       [x] Closed door (move<Direction>)
//       [x] Missing key (openDoor)
//       [x] No button to push (pushButton)
//       [x] No chest to open (openChest)
//       [x] Found <Key color> key (openChest)
// [x] Change robot graphics when picking up key
// [x] Splash message when completing level
// [x] Disable code textarea when pressing "Run" button
// [x] Add "Retry" button
// [x] Handle finishing last level
// [x] Syntax check robot script input
//       [x] Error message when parsing
//       [x] Show error in status area
// [x] `loop` support
//       [x] Level that is just `loop { <everything> }`
//       [x] Level that is `<instr one>, <instr two>, <...>, loop { <rest> }`
// [x] Document `loop`
// [x] Fix bug when clicking "Retry" while the robot is moving
// [x] Merge PR
// [ ] Keep key after unlocking door to be able to check for key color
//     even after passing through door
// [ ] Connect with hardware (RasPi)
// [ ] Documentation depends on level (implement using css classes and js)
// [ ] `count`/`getCount` support
// [ ] 'loop (cond)' support
//       [ ] Level that requires use of `loop (cond)`
// [ ] Document `count` and `loop (cond)`
// [ ] Support for MethodBlock in conditionals
// [ ] Split source into several files
// [ ] Support for functions
// [ ] Message queue for status msgs so that they are always shown 3 secs
// [ ] Freeplay mode where you can enter commands one at a time and the
//     robot follows them.  Used to interactivly controll the LEDs
var robot;
var now;
var deltaTime;
var last = timestamp();
var tokenizer;
var program;

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
var levels = [{}, {}, {}, {}, {}];
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
    ['4A', '0-', '0-', '0-', '0-', '0-'],
    ['5-', '0-', '0-', '6-', 'C-', '0-'],
    ['3-', 'A-', 'A-', '9-', '1B', '0-'],
    ['0-', '0-', '0-', '0-', '0-', '0-'],
    ['0-', '0-', '0-', '0-', '0-', '0-'],
    ['0-', '0-', '0-', '0-', '0-', '0-']];
levels[1].items = [[], [], [], [], [], []];
levels[1].items[2][4] = {
        key: 'buttons',
        index: '0'
    };
levels[1].leds = [{on: false}];
levels[1].buttons = [{
        controlls: {
            key: 'leds',
            index: 0
        }
    }];

levels[2].field = [
    ['4-', '0-', '6-', 'AD', 'C-', '0-'],
    ['3B', 'AC', 'F-', 'AE', 'F-', 'C-'],
    ['0-', '0-', '3-', 'AF', '9-', '5-'],
    ['0-', '0-', '0-', '0-', '0-', '5-'],
    ['0-', '0-', '0-', '0-', '0-', '5-'],
    ['0-', '0-', '0-', '0-', '0-', '1B']];
levels[2].items = [[], [], [], [], [], []];
levels[2].items[1][0] = {
        key: 'buttons',
        index: '0'
    };
levels[2].items[5][5] = {
        key: 'buttons',
        index: '1'
    };
levels[2].items[0][3] = {
        key: 'doors',
        index: 0
    };
levels[2].items[1][3] = {
        key: 'doors',
        index: 1
    };
levels[2].items[2][3] = {
        key: 'doors',
        index: 2
    };
levels[2].items[1][1] = {
        key: 'chests',
        index: 0
    };
levels[2].leds = [{on: false}, {on: false}];
levels[2].buttons = [{
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
levels[2].doors = [{open: false}, {open: false}, {open: false}];
levels[2].chests = [{open: false}];

levels[3].field = [
    ['2B', 'C-', '0-', '0-', '0-', '0-'],
    ['0-', '3-', 'C-', '0-', '0-', '0-'],
    ['0-', '0-', '3-', 'C-', '0-', '0-'],
    ['0-', '0-', '0-', '3-', 'C-', '0-'],
    ['0-', '0-', '0-', '0-', '3-', 'C-'],
    ['0-', '0-', '0-', '0-', '0-', '1A']];
levels[3].items = [[], [], [], [], [], []];
levels[3].items[0][0] = {
        key: 'buttons',
        index: '0'
    };
levels[3].leds = [{on: false}];
levels[3].buttons = [{
        controlls: {
            key: 'leds',
            index: 0
        }
    }];

levels[4].field = [
    ['0-', '6-', 'A-', 'A-', 'A-', 'CB'],
    ['0-', '5-', '0-', '0-', '0-', '5-'],
    ['0-', '3-', 'C-', '6-', 'A-', 'D-'],
    ['0-', '0-', '7-', '9-', '0-', '5-'],
    ['6-', '8A', '5-', '6-', 'C-', '5-'],
    ['3-', 'A-', 'B-', '9-', '3-', '9-']];
levels[4].items = [[], [], [], [], [], []];
levels[4].items[0][5] = {
        key: 'buttons',
        index: '0'
    };
levels[4].leds = [{on: false}];
levels[4].buttons = [{
        controlls: {
            key: 'leds',
            index: 0
        }
    }];
var currentLevel = -1;

var gameState = 'MENU';

var memory = {
    lbl: {}
};
var statusMessage = '';
function setStatusMessage(msg) {
    statusMessage = msg;
    drawPlayingField();
    clearTimeout(setStatusMessage.timoutId);
    setStatusMessage.timeoutId = setTimeout(function () {
        statusMessage = "";
        drawPlayingField();
    }, 3000);
}

function getStatusMessage() {
    return statusMessage;
}

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
    var context = $('.game_menu')[0].getContext('2d', {alpha: false});
    var img = new Image();
    var text = "Click to start level " + (currentLevel + 2);

    img.onload = function () {
        context.drawImage(img, 0, 0);
        context.font = "36px Calibri";
        context.fillStyle = '#ff00dc';
        var textX = (img.width - context.measureText(text).width) / 2 | 0;
        context.fillText(text, textX, img.height - 180);
    };

    img.src = "game_menu.png";
}

function drawLevelCompletedSplash() {
    var context = $('.level_completed_splash')[0].getContext('2d');
    var img = new Image();
    img.src = "level_completed.png";

    img.onload = function () {
        context.drawImage(img, 175, 110);
    };
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

    function roundedRect(context, x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        context.beginPath();
        context.moveTo(x+r - 1, y);
        context.arcTo(x+w, y,   x+w, y+h, r);
        context.arcTo(x+w, y+h, x,   y+h, r);
        context.arcTo(x,   y+h, x,   y,   r);
        context.arcTo(x,   y,   x+w, y,   r);
        context.fill();
        context.stroke();
        context.closePath();
    }

    function drawStatusAreaBorder(context, x, y) {
        context.strokeStyle = '#777';
        context.fillStyle = 'white';
        roundedRect(context, x, y, 300, 28, 4);

        context.fillStyle = '#000';
        context.font = "16px Calibri";
        context.fillText(statusMessage, x + 6, y + 18);
    }

    function drawTile(context, tile, fieldItem, x, y) {
        function drawItem(item, x, y) {
            var imgStr = '<img src="' + item + '.png" class="field_item"></img>';
            var itemElement = $(imgStr);
            itemElement.css('top', y + 10);
            itemElement.css('left', x + 10);
            $('.game_area').append(itemElement);
        }

        var door;
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
            door = levels[currentLevel].doors[fieldItem.index];
            if (!door.open) {
                drawItem('door_red', x, y);
            } else {
                drawItem('door_red_open', x, y);
            }
        }

        if (tile[1] === 'E') {
            door = levels[currentLevel].doors[fieldItem.index];
            if (!door.open) {
                drawItem('door_green', x, y);
            } else {
                drawItem('door_green_open', x, y);
            }
        }

        if (tile[1] === 'F') {
            door = levels[currentLevel].doors[fieldItem.index];
            if (!door.open) {
                drawItem('door_blue', x, y);
            } else {
                drawItem('door_blue_open', x, y);
            }
        }

        context.stroke();
    }

    var canvas = $('.field')[0];
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 2;

    levels[currentLevel].field.forEach(function (line, lineIndex) {
        line.forEach(function (tile, tileIndex) {
            var item = levels[currentLevel].items[lineIndex][tileIndex];
            drawTile(context, tile, item, tileIndex * 68 + 1, lineIndex * 68 + 1);
        });
    });

    var statusAreaY = levels[currentLevel].field.length * 68 + 10;
    var statusAreaX = levels[currentLevel].field[0].length * 68;
    drawLEDs(levels[currentLevel].leds.length, context, statusAreaX - 12, statusAreaY + 16);
    drawStatusAreaBorder(context, 4, statusAreaY + 2);
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
    $('input.run').on('click', function() {
        program = new Program(buildAst());
        robot.currentInstruction = program.nextInstruction();
        robot.instructionCompleted = false;
        $('textarea').prop("disabled", true);
        $('input.clear').prop("disabled", true);
        $('input.run, input.retry').toggleClass('hidden');
    });

    $('input.retry').on('click', function () {
        $('input.run, input.retry').toggleClass('hidden');
        $('input.clear').prop("disabled", false);
        $('textarea').prop("disabled", false);

        levels[currentLevel].chests.forEach(function (chest) {
            chest.open = false;
        });

        levels[currentLevel].doors.forEach(function (door) {
            door.open = false;
        });

        levels[currentLevel].leds.forEach(function (led) {
            led.on = false;
        });

        robot.dx = 0;
        robot.dy = 0;
        robot.currentInstruction = 'wait';
        robot.instructionCompleted = false;
        robot.stop(true);
        delete robot.key;
        robot[0].src = 'robot.png';
        setPlayerPosition(getStartPosition());
        program = new Program(buildAst());
        $('.field_item').remove();
        drawPlayingField();
    });

    $('.game_menu, .level_completed_splash').on('click', function() {
        changeGameState();
    });

    $('body').on('keypress', function (event) {
        if (gameState === 'MENU') {
            var num = -48 + event.which;
            currentLevel = num - 2;
            changeGameState();
        }
    });
}

function changeGameState() {
    if (gameState === 'MENU') {
        currentLevel++;
        $('.game_area textarea')
            .val('')
            .prop("disabled", false);
        $('input.clear').prop("disabled", false);
        $('input.run').removeClass('hidden');
        $('input.retry').addClass('hidden');
        $('.field_item').remove();
        drawPlayingField();
        setPlayerPosition(getStartPosition());
        $('.game_menu').hide();
        $('.level_completed_splash').hide();
        gameState = 'GAME';
    } else if (gameState === 'GAME') {
        $('.level_completed_splash').show();
        drawLevelCompletedSplash();
        robot.currentInstruction = 'wait';
        robot.instructionCompleted = false;
        gameState = 'LEVEL_COMPLETED';
    } else {
        if (currentLevel === levels.length - 1) {
            currentLevel = -1;
        }

        $('.level_completed_splash').hide();
        $('.game_menu').show();
        drawGameMenu();
        gameState = 'MENU';
    }
}

function timestamp() {
    return window.performance && window.performance.now ?
        window.performance.now() :
        new Date().getTime();
}

function buildAst() {
    var ast = new TreeNode('', true);
    var script = $('textarea').val();
    var tokenizer = new Tokenizer(script);
    var parser = new Parser(tokenizer, ast);
    var errorMessages = [];

    var currentToken;

    while (!!(currentToken = tokenizer.getNextToken())) {
        var instruction = parser.parseMethodInvocation();

        if (!instruction) {
            instruction = parser.parseConditionalStatement();
        }

        if (!instruction) {
            instruction = parser.parseLoopStatement();
        }

        errorMessages = errorMessages.concat(parser.getErrors());

        if (!instruction) {
            errorMessages.push("Unrecognized token \"" + currentToken + "\"");
        }

        if (errorMessages.length) {
            setStatusMessage(errorMessages[0]);

            break;
        }

        ast.newLevelChild(instruction);
    }

    return ast;
}

function Program(ast) {
    this.instructionArray = ast.toArray();
    this.instructionPointer = -1;
}

Program.prototype.nextInstruction = function () {
    return this.instructionArray[++this.instructionPointer];
};

Program.prototype.getInstructionPointer = function () {
    return this.instructionPointer;
};

Program.prototype.setInstructionPointer = function (instructionPointer) {
    this.instructionPointer = instructionPointer - 1;
};

function update(deltaTime) {
    function levelCompleted() {
        for (var i = 0; i < levels[currentLevel].leds.length; i++) {
            if (!levels[currentLevel].leds[i].on) {
                return false;
            }
        }

        return true;
    }

    function standingOnClosedDoor() {
        var tileCoords = robot.currentTileCoords();
        var item = levels[currentLevel].items[tileCoords.y][tileCoords.x];
        var closedDoor = false;

        if (item && item.key === 'doors') {
            closedDoor = !levels[currentLevel].doors[item.index].open;
        }

        return closedDoor;
    }

    function movingThroughWall(direction) {
        var tileCoords = robot.currentTileCoords();
        var tile = levels[currentLevel].field[tileCoords.y][tileCoords.x];
        var tileOpenings = parseInt(tile[0], 16);

        switch (direction) {
            case 'up':    return !(tileOpenings & 1);
            case 'right': return !(tileOpenings & 2);
            case 'down':  return !(tileOpenings & 4);
            case 'left':  return !(tileOpenings & 8);
        }
    }

    function robotIsMoving() {
        return robot.dx !== 0 || robot.dy !== 0;
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

    function robotPushAnimation(){
        robot.animate({ opacity: 1 }, 50, function () { robot[0].src = "img_push/robot_push_1.png"; });
        robot.animate({ opacity: 1 }, 50, function () { robot[0].src = "img_push/robot_push_2.png"; });
        robot.animate({ opacity: 1 }, 50, function () { robot[0].src = "img_push/robot_push_3.png"; });
        robot.animate({ opacity: 1 }, 50, function () { robot[0].src = "img_push/robot_push_4.png"; });
        robot.animate({ opacity: 1 }, 50, function () { robot[0].src = "img_push/robot_push_5.png"; });
        robot.animate({ opacity: 1 }, 50, function () { robot[0].src = "img_push/robot_push_4.png"; });
        robot.animate({ opacity: 1 }, 50, function () { robot[0].src = "img_push/robot_push_3.png"; });
        robot.animate({ opacity: 1 }, 50, function () { robot[0].src = "img_push/robot_push_2.png"; });
        robot.animate({ opacity: 1 }, 50, function () { robot[0].src = "img_push/robot_push_1.png"; });
        robot.animate({ opacity: 1 }, 50, function () {
            robot[0].src = "robot.png";
            robot.instructionCompleted = true;
        });
    }

    var tileCoords = robot.currentTileCoords();
    var currentInstruction = (robot.currentInstruction || '').split(' ');
    var item;

    switch (currentInstruction[0]) {
        case 'right':
        case 'left':
        case 'down':
        case 'up':
            if (!robotIsMoving()) {
                if (movingThroughWall(currentInstruction[0])) {
                    setStatusMessage("You can't walk through walls");
                    robot.currentInstruction = program.nextInstruction();
                    return;
                } else if (standingOnClosedDoor()) {
                    setStatusMessage("You banged straight in to a closed door");
                    robot.currentInstruction = program.nextInstruction();
                    return;
                }

                switch (currentInstruction[0]) {
                    case 'right': robot.dx = 1;  break;
                    case 'left':  robot.dx = -1; break;
                    case 'down':  robot.dy = 1;  break;
                    case 'up':    robot.dy = -1; break;
                }
            }
            move();
            break;
        case 'pushButton':
            if (robot.queue().length === 0 && !robot.instructionCompleted) {
                item = levels[currentLevel].items[tileCoords.y][tileCoords.x];
                if (item && item.key === 'buttons') {
                    robotPushAnimation();
                    var button = levels[currentLevel].buttons[item.index];
                    var controlledItem = levels[currentLevel][button.controlls.key][button.controlls.index];
                    controlledItem.on = !controlledItem.on;
                    drawPlayingField();
                } else {
                    setStatusMessage("No button found here");
                    robot.instructionCompleted = true;
                }
            }
            break;
        case 'openChest':
            var keys = ['red', 'green', 'blue'];
            var foundKey = keys[Math.floor(Math.random() * keys.length)];
            item = levels[currentLevel].items[tileCoords.y][tileCoords.x];
            if (item && item.key === 'chests') {
                var chest = levels[currentLevel].chests[item.index];
                if (!chest.open) {
                    chest.open = true;
                    robot.key = foundKey;
                    robot[0].src = 'robot_key_' + foundKey + '.png';
                    setStatusMessage("You collected a " + foundKey + " key!");
                } else {
                    setStatusMessage("You can't open an already open chest");
                }
            } else {
                setStatusMessage("Nice try, but there is no chest here");
            }

            robot.instructionCompleted = true;
            break;
        case 'openDoor':
            var tile = levels[currentLevel].field[tileCoords.y][tileCoords.x];
            item = levels[currentLevel].items[tileCoords.y][tileCoords.x];
            if (item && item.key === 'doors') {
                var door = levels[currentLevel].doors[item.index];

                if (tile[1] === 'D' && robot.key === 'red' ||
                        tile[1] === 'E' && robot.key === 'green' ||
                        tile[1] === 'F' && robot.key === 'blue') {
                    door.open = true;
                    robot[0].src = 'robot.png';
                } else {
                    setStatusMessage("You need the correct key to open this door");
                }

                $('.field_item').remove();
                drawPlayingField();
            } else {
                setStatusMessage("There is no door");
            }

            robot.instructionCompleted = true;
            break;
        case 'hasRedKey':
            memory.retVal = robot.key === 'red';
            robot.currentInstruction = program.nextInstruction();
            return;
        case 'hasGreenKey':
            memory.retVal = robot.key === 'green';
            robot.currentInstruction = program.nextInstruction();
            return;
        case 'hasBlueKey':
            memory.retVal = robot.key === 'blue';
            robot.currentInstruction = program.nextInstruction();
            return;
        case 'cond':
            if (memory.retVal) {
                program.setInstructionPointer(
                    program.getInstructionPointer() +
                        parseInt(currentInstruction[1]));
            }

            robot.currentInstruction = program.nextInstruction();

            return;
        case 'lbl':
            memory.lbl[currentInstruction[1]] = program.getInstructionPointer();
            robot.currentInstruction = program.nextInstruction();
            return;
        case 'jmp':
            program.setInstructionPointer(memory.lbl[currentInstruction[1]]);
            robot.currentInstruction = program.nextInstruction();
            return;
        case 'jmpr':
            program.setInstructionPointer(
                program.getInstructionPointer() +
                    parseInt(currentInstruction[1]));
            robot.currentInstruction = program.nextInstruction();
            return;
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
                robot.currentInstruction = program.nextInstruction();
                robot.instructionCompleted = false;
            }
        }
    }
}

function updateLevelCompleted(deltaTime) {
    if (!updateLevelCompleted.timeToWait) {
        updateLevelCompleted.timeToWait = 2000;
    }

    updateLevelCompleted.timeToWait -= deltaTime;

    if (updateLevelCompleted.timeToWait <= 0) {
        delete updateLevelCompleted.timeToWait;
        changeGameState();
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
    } else if (gameState === 'LEVEL_COMPLETED') {
        updateLevelCompleted(deltaTime);
    }

    last = now;

    requestAnimationFrame(frame);
}

function TreeNode(data, isRoot) {
    this.data = data;
    this.isRoot = isRoot;
    this.children = [];
}

TreeNode.prototype.newLevelChild = function(data) {
    if (this.children.length === 0) {
        this.children.push(new TreeNode(data));
    } else {
        this.children[0].newLevelChild(data);
    }
};

TreeNode.prototype.toArray = function() {
    var array = this.data ? this.data.toArray() : [];

    if (this.children.length) {
        var childArray = this.children[0].toArray();
        array = this.isRoot ? childArray : array.concat(childArray);
    }

    return array;
};

function MethodInvocation(method, invocations) {
    this.method = method;
    this.invocations = invocations || 1;
}

MethodInvocation.prototype.toArray = function () {
    var array = [];

    for (var i = 0; i < this.invocations; i++) {
        array.push(this.method);
    }

    return array;
};

MethodInvocation.create = function (name, args) {
    if (name.indexOf('move') === 0) {
        var direction = name.substring(4, name.length).toLowerCase();
        var repetitions = args[0];
        methodInvocation = new MethodInvocation(direction, repetitions);
    } else {
        methodInvocation = new MethodInvocation(name);
    }

    return methodInvocation;
};

function ConditionalStatement(methodInvocation, ifPart) {
    this.methodInvocation = methodInvocation;
    this.ifPart = ifPart;
}

ConditionalStatement.prototype.toArray = function () {
    var array = this.methodInvocation.toArray();
    array.push('cond 2');
    array.push('jmpr ' + (this.ifPart.toArray().length + 1));
    array = array.concat(this.ifPart.toArray());

    return array;
};

function MethodBlock(methodInvocations) {
    this.methodInvocations = methodInvocations;
}

MethodBlock.prototype.toArray = function () {
    var array = [];
    this.methodInvocations.forEach(function (inv) {
        array = array.concat(inv.toArray());
    });

    return array;
};

function LoopStatement(methodBlock) {
    this.methodBlock = methodBlock;
    LoopStatement.prototype.num = (this.num || 0) + 1;
    console.log(this.num);
}

LoopStatement.prototype.getId = function () {
    return 'loop_statement_' + this.num;
};

LoopStatement.prototype.toArray = function () {
    var array = ['lbl ' + this.getId()];
    array = array.concat(this.methodBlock.toArray());
    array.push('jmp ' + this.getId());

    return array;
};

function Tokenizer(code) {
    this.tokens = code
        .split(/([().{}])|[; \n]/)
        .filter(function (item) { return item; });
    this.currentToken = this.tokens[0];
}

Tokenizer.prototype.getNextToken = function () {
    return (this.currentToken = this.tokens.shift());
};

Tokenizer.prototype.getCurrentToken = function () {
    return this.currentToken;
};

function Parser(tokenizer, ast) {
    this.tokenizer = tokenizer;
    this.ast = ast;
    this.errors = [];
}

Parser.prototype.parseMethodInvocation = function () {
    var token = this.tokenizer.getCurrentToken();

    if (token === 'robot' && this.tokenizer.getNextToken() === '.') {
        var methodName = this.tokenizer.getNextToken();
        token = this.tokenizer.getNextToken(); // Eat '('
        if (token !== '(') {
            this.addError('Missing "("');
            return MethodInvocation.create(methodName, []);
        }

        var args = [];
        while ((token = this.tokenizer.getNextToken()) != ')') {
            if (!token) {
                this.addError('Missing ")"');
                break;
            }

            args.push(token);
        }

        return MethodInvocation.create(methodName, args);
    }
};

Parser.prototype.parseConditionalStatement = function () {
    var token = this.tokenizer.getCurrentToken();

    if (token === 'if' && this.tokenizer.getNextToken() === '(') {
        this.tokenizer.getNextToken(); // Prep tokenizer for parsing method invocation
        var methodInvocation = this.parseMethodInvocation();

        token = this.tokenizer.getNextToken(); // Eat ')'
        if (token !== ')') {
            this.addError('Missing ")"');
            return null;
        }

        token = this.tokenizer.getNextToken(); // Eat '{'
        if (token !== '{') {
            this.addError('Missing "{"');
            return null;
        }

        token = this.tokenizer.getNextToken(); // Prep tokenizer for parsing method invocation
        var ifPart = this.parseMethodInvocation();
        if (!ifPart) {
            this.addError('Missing method invocation');
        }

        token = this.tokenizer.getNextToken(); // Eat '}'
        if (token !== '}') {
            this.addError('Missing "}"');
        }

        return new ConditionalStatement(methodInvocation, ifPart);
    }
};

Parser.prototype.parseLoopStatement = function () {
    var token = this.tokenizer.getCurrentToken();
    var methodBlock;

    if (token === 'loop' && this.tokenizer.getNextToken() === '{') {
        methodBlock = this.parseMethodBlock();
    }

    return new LoopStatement(methodBlock);
};

Parser.prototype.parseMethodBlock = function () {
    var token = this.tokenizer.getCurrentToken();
    var methodInvocations = [];

    while ((token = this.tokenizer.getNextToken()) !== '}') {
        if (!token) {
            this.addError('Missing "}"');
            break;
        }

        methodInvocations.push(this.parseMethodInvocation());
    }

    return new MethodBlock(methodInvocations);
};

Parser.prototype.addError = function (errorMessage) {
    this.errors.push(errorMessage);
};

Parser.prototype.getErrors = function () {
    return this.errors;
};

