var robot;
var now;
var deltaTime;
var last = timestamp();
var tokenizer;
var program;

var memory = {
    lbl: {},
    count: 0,
    retVal: [],
    ips: []
};

var gameState = 'MENU';

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
    for (var y = 0; y < getCurrentLevel().field.length; y++) {
        for (var x = 0; x < getCurrentLevel().field[y].length; x++) {
            if (getCurrentLevel().field[y][x][1] === 'A') {
                return {x: x, y: y};
            }
        }
    }

    return {x: 0, y: 0};
}

function drawGameMenu() {
    var context = $('.game_menu')[0].getContext('2d', {alpha: false});
    var img = new Image();
    var text = "Click to start level " + getNextLevelName();

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
            if (getCurrentLevel().leds[ledCount - 1 - i].on) {
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

    function drawKey(context, color, x, y) {
        if (!robot.key) {
            context.fillStyle = '#fff';
            context.fillRect(x, y, 24, 24);
            return;
        }

        var img = new Image();

        img.onload = function () {
            context.drawImage(img, x, y);
        };

        img.src = "key_" + color + ".png";
    }

    function drawTile(context, tile, fieldItem, x, y) {
        function drawItem(item, x, y) {
            var img = new Image();

            img.onload = function () {
                context.drawImage(img, x + 10, y + 10);
            };

            img.src = item + ".png";
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
            door = getCurrentLevel().doors[fieldItem.index];
            if (!door.open) {
                drawItem('door_red', x, y);
            } else {
                drawItem('door_red_open', x, y);
            }
        }

        if (tile[1] === 'E') {
            door = getCurrentLevel().doors[fieldItem.index];
            if (!door.open) {
                drawItem('door_green', x, y);
            } else {
                drawItem('door_green_open', x, y);
            }
        }

        if (tile[1] === 'F') {
            door = getCurrentLevel().doors[fieldItem.index];
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

    getCurrentLevel().field.forEach(function (line, lineIndex) {
        line.forEach(function (tile, tileIndex) {
            var item = getCurrentLevel().items[lineIndex][tileIndex];
            drawTile(context, tile, item, tileIndex * 68 + 1, lineIndex * 68 + 1);
        });
    });

    var statusAreaY = getCurrentLevel().field.length * 68 + 10;
    var statusAreaX = getCurrentLevel().field[0].length * 68;
    drawLEDs(getCurrentLevel().leds.length, context, statusAreaX - 12, statusAreaY + 16);
    drawStatusAreaBorder(context, 4, statusAreaY + 2);
    drawKey(context, robot.key, 309, statusAreaY + 5);
}

function createPlayer(startCoordinates) {
    robot = {
        img: new Image(),
        renderTop: 6,
        renderLeft: 6,
        dx: 0,
        dy: 0,
        x: 0,
        y: 0,
        speed: 2,
        currentTileCoords: function () {
            return {
                x: robot.x / 100 | 0,
                y: robot.y / 100 | 0
            };
        }
    };
    robot.img.src = 'robot.png';
    $('.game_area').append(robot);
}

function setPlayerPosition(coords) {
    robot.renderTop = 6 + coords.y * 68;
    robot.renderLeft = 6 + coords.x * 68;
    robot.x = coords.x * 100;
    robot.y = coords.y * 100;
}

function attachClickHandlers() {
    $('input.run').on('click', function() {
        program = new Program(buildAst().toArray());
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

        if (getCurrentLevel().chests) {
            getCurrentLevel().chests.forEach(function (chest) {
                chest.open = false;
            });
        }

        if (getCurrentLevel().doors) {
            getCurrentLevel().doors.forEach(function (door) {
                door.open = false;
            });
        }

        getCurrentLevel().leds.forEach(function (led) {
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
        program = new Program(buildAst().toArray());
        $('.field_item').remove();
        drawPlayingField();
    });

    $('.game_menu, .level_completed_splash').on('click', function() {
        changeGameState();
    });

    $('body').on('keypress', function (event) {
        if (gameState === 'MENU') {
            var num = -48 + event.which;
            var selectedLevelIndex = num - 1;

            if (getLevel(selectedLevelIndex).chests) {
                getLevel(selectedLevelIndex).chests.forEach(function (chest) {
                    chest.open = false;
                });
            }

            if (getLevel(selectedLevelIndex).doors) {
                getLevel(selectedLevelIndex).doors.forEach(function (door) {
                    door.open = false;
                });
            }

            getLevel(selectedLevelIndex).leds.forEach(function (led) {
                led.on = false;
            });

            delete robot.key;

            // currentLevel will be increased by one in changeGameState()
            setCurrentLevelIndex(selectedLevelIndex - 1);
            changeGameState();
        }
    });
}

function changeGameState() {
    if (gameState === 'MENU') {
        moveToNextLevel();
        $('.game_area textarea')
            .val('')
            .prop("disabled", false);
        $('input.clear').prop("disabled", false);
        $('input.run').removeClass('hidden');
        $('input.retry').addClass('hidden');
        $('.field_item').remove();
        delete robot.key;
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
        for (var i = 0; i < getCurrentLevel().leds.length; i++) {
            $.ajax('http://localhost:8080/' + i, {
                method: "PUT",
                data: "off",
            });
        }
        gameState = 'LEVEL_COMPLETED';
    } else {
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
    var parser = new Parser(tokenizer);
    var errorMessages = [];

    var currentToken;

    while (!!(currentToken = tokenizer.getNextToken())) {
        var instruction = parser.parseMethodInvocation();

        if (!instruction) {
            instruction = parser.parseConditionalStatement();
        }

        if (!instruction) {
            instruction = parser.parseFunctionDefinition();
        }

        if (!instruction) {
            instruction = parser.parseLoopStatement();
        }

        if (!instruction) {
            instruction = parser.parseFunctionCall();
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

function update(deltaTime) {
    function levelCompleted() {
        for (var i = 0; i < getCurrentLevel().leds.length; i++) {
            if (!getCurrentLevel().leds[i].on) {
                return false;
            }
        }

        return true;
    }

    function robotPushAnimation(triggerAction) {
        /*robot.animate({ opacity: 1 }, 50, function () { robot[0].src = "img_push/robot_push_1.png"; });
        robot.animate({ opacity: 1 }, 50, function () { robot[0].src = "img_push/robot_push_2.png"; });
        robot.animate({ opacity: 1 }, 50, function () { robot[0].src = "img_push/robot_push_3.png"; });
        robot.animate({ opacity: 1 }, 50, function () { robot[0].src = "img_push/robot_push_4.png"; });
        robot.animate({ opacity: 1 }, 50, function () {
            robot[0].src = "img_push/robot_push_5.png";
            triggerAction();
        });
        robot.animate({ opacity: 1 }, 50, function () { robot[0].src = "img_push/robot_push_4.png"; });
        robot.animate({ opacity: 1 }, 50, function () { robot[0].src = "img_push/robot_push_3.png"; });
        robot.animate({ opacity: 1 }, 50, function () { robot[0].src = "img_push/robot_push_2.png"; });
        robot.animate({ opacity: 1 }, 50, function () { robot[0].src = "img_push/robot_push_1.png"; });
        robot.animate({ opacity: 1 }, 50, function () {
            robot[0].src = "robot.png";
            robot.instructionCompleted = true;
        });*/
       triggerAction();
       robot.instructionCompleted = true;
    }

    function robotPushAnimationTriggerAction() {
        var button = getCurrentLevel().buttons[item.index];
        var controlledItem = getCurrentLevel()[button.controlls.key][button.controlls.index];
        controlledItem.on = !controlledItem.on;
        var url = 'http://localhost:8080/' + button.controlls.index;
        $.ajax(url, {
            method: "PUT",
            data: controlledItem.on ? "on" : "off",
        });
        drawPlayingField();
    }

    function robotPushAnimationWithTriggerAction() {
        robotPushAnimation(robotPushAnimationTriggerAction);
    }

    handleInstruction(robot, program, memory, robotPushAnimationWithTriggerAction, drawPlayingField, setStatusMessage);

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
    var canvas = $('.field')[0];
    var context = canvas.getContext('2d');
    context.fillStyle = '#fff';
    context.fillRect(robot.renderLeft, robot.renderTop, 57, 57);
    // The robot takes 100 steps when moving from one map tile to the next
    // Each map tile is 68 x 68 pixels
    // So each robot step is 68/100 pixels
    robot.renderLeft = 6 + Math.round(robot.x * 68 / 100);
    robot.renderTop = 6 + Math.round(robot.y * 68 / 100);
    context.drawImage(robot.img, robot.renderLeft, robot.renderTop);
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

