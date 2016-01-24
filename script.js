var robot;
var now;
var deltaTime;
var last = timestamp();
var offscreenImage;
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
    drawDymanicGameElements();
    clearTimeout(setStatusMessage.timoutId);
    setStatusMessage.timeoutId = setTimeout(function () {
        statusMessage = "";
        drawDymanicGameElements();
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

function drawGameArea() {
    function drawStatusAreaBorder(context, x, y) {
        context.strokeStyle = '#777';
        context.fillStyle = 'white';
        roundedRect(context, x, y, 300, 28, 4);

        context.fillStyle = '#000';
        context.font = "16px Calibri";
        context.fillText(statusMessage, x + 6, y + 18);
    }

    function drawTileWalls(context, tile, fieldItem, x, y) {
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

        context.stroke();
    }

    var offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    var offscreenContext = offscreenCanvas.getContext('2d');
    offscreenContext.clearRect(0, 0, canvas.width, canvas.height);
    offscreenContext.lineWidth = 2;

    getCurrentLevel().field.forEach(function (line, lineIndex) {
        line.forEach(function (tile, tileIndex) {
            var item = getCurrentLevel().items[lineIndex][tileIndex];
            drawTileWalls(offscreenContext, tile, item, tileIndex * 68 + 1, lineIndex * 68 + 1);
        });
    });

    drawStatusAreaBorder(offscreenContext, 4, statusAreaY + 2);
    offscreenImage = offscreenContext.getImageData(0, 0, canvas.width, canvas.height);
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

function drawDymanicGameElements() {
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

    function drawTileItem(context, tile, fieldItem, x, y) {
        function drawItem(item, x, y) {
            var img = new Image();

            img.onload = function () {
                context.drawImage(img, x + 10, y + 10);
            };

            img.src = item + ".png";
        }

        var door;

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
    }

    var canvas = $('.field')[0];
    var context = canvas.getContext('2d');
    var statusAreaY = getCurrentLevel().field.length * 68 + 10;
    var statusAreaX = getCurrentLevel().field[0].length * 68;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 2;

    context.putImageData(offscreenImage, 0, 0);

    getCurrentLevel().field.forEach(function (line, lineIndex) {
        line.forEach(function (tile, tileIndex) {
            var item = getCurrentLevel().items[lineIndex][tileIndex];
            drawTileItem(context, tile, item, tileIndex * 68 + 1, lineIndex * 68 + 1);
        });
    });

    drawLEDs(getCurrentLevel().leds.length, context, statusAreaX - 12, statusAreaY + 16);
    drawKey(context, robot.key, 309, statusAreaY + 5);
}

function createPlayer(startCoordinates) {
    robot = {
        img: new Image(),
        speed: 2,
        currentTileCoords: function () {
            return {
                x: robot.x / 100 | 0,
                y: robot.y / 100 | 0
            };
        }
    };
    setRobotInitialValues({x: 0, y: 0});
    robot.img.src = 'robot.png';
}

function prepareToPlay() {
    setRobotInitialValues(getStartPosition());
    resetItems();
    drawGameArea();
    drawDymanicGameElements();
    setPageElementsToInitialState();
}

function setRobotInitialValues(coords) {
    robot.renderTop = 6 + coords.y * 68;
    robot.renderLeft = 6 + coords.x * 68;
    robot.x = coords.x * 100;
    robot.y = coords.y * 100;
    robot.dx = 0;
    robot.dy = 0;
    robot.currentInstruction = 'wait';
    robot.instructionCompleted = false;
}

function resetItems() {
    (getCurrentLevel().chests || []).forEach(function (chest) {
        chest.open = false;
    });

    (getCurrentLevel().doors || []).forEach(function (door) {
        door.open = false;
    });

    getCurrentLevel().leds.forEach(function (led) {
        led.on = false;
    });

    delete robot.key;
}

function setPageElementsToInitialState() {
    $('input.clear').prop("disabled", false);
    $('textarea').prop("disabled", false);
    $('input.clear').prop("disabled", false);
    $('input.run').removeClass('hidden');
    $('input.retry').addClass('hidden');
    $('.level_completed_splash').hide();
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
        prepareToPlay();

        program = new Program(buildAst().toArray());
    });

    $('.game_menu, .level_completed_splash').on('click', function() {
        changeGameState();
    });

    $('body').on('keypress', function (event) {
        if (gameState === 'MENU') {
            var num = -48 + event.which;
            var selectedLevelIndex = num - 1;

            // currentLevel will be increased by one in changeGameState()
            setCurrentLevelIndex(selectedLevelIndex - 1);
            changeGameState();
        }
    });
}

function changeGameState() {
    if (gameState === 'MENU') {
        moveToNextLevel();
        prepareToPlay();
        $('.game_area textarea').val('');
        $('.game_menu').hide();
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
        drawDymanicGameElements();
    }

    function robotPushAnimationWithTriggerAction() {
        robotPushAnimation(robotPushAnimationTriggerAction);
    }

    handleInstruction(robot, program, memory, robotPushAnimationWithTriggerAction, drawDymanicGameElements, setStatusMessage);

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

