var robot;
var now;
var deltaTime;
var last = timestamp();
var fieldCanvas;
var elementsCanvas;
var robotCanvas;
var tokenizer;
var program;
var renderQueue = [];
var images = {};

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
    renderQueue.push("STATUS_MESSAGE");
    clearTimeout(setStatusMessage.timoutId);
    setStatusMessage.timeoutId = setTimeout(function () {
        statusMessage = "";
        renderQueue.push("STATUS_MESSAGE");
    }, 3000);
}

function getStatusMessage() {
    return statusMessage;
}

function addToRenderQueue(item) {
    renderQueue.push(item);
}

$(function () {
    fieldCanvas = $('.field')[0];
    elementsCanvas = $('.interactive_elements')[0];
    robotCanvas = $('.robot')[0];
    attachClickHandlers();
    drawGameMenu();
    createPlayer();
    createImageReferences();
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

function clearRobot() {
    var robotContext = robotCanvas.getContext('2d');
    robotContext.clearRect(0, 0, robotCanvas.width, robotCanvas.height);
}

function drawGameArea() {
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

    var fieldContext = fieldCanvas.getContext('2d');
    fieldContext.clearRect(0, 0, fieldCanvas.width, fieldCanvas.height);
    fieldContext.lineWidth = 2;

    getCurrentLevel().field.forEach(function (line, lineIndex) {
        line.forEach(function (tile, tileIndex) {
            var item = getCurrentLevel().items[lineIndex][tileIndex];
            drawTileWalls(fieldContext, tile, item, tileIndex * 68 + 1, lineIndex * 68 + 1);
        });
    });

    var statusAreaY = getCurrentLevel().field.length * 68 + 10;
    var statusAreaX = getCurrentLevel().field[0].length * 68;
    drawStatusAreaBorder(fieldContext, 4, statusAreaY + 2);
    drawLEDs(getCurrentLevel().leds.length, fieldContext, statusAreaX - 12, statusAreaY + 16);
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

function drawDynamicGameElements() {
    function drawTileItem(context, tile, fieldItem, x, y) {
        function drawItem(item, x, y) {
            context.drawImage(images[item], x + 10, y + 10);
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

    var context = elementsCanvas.getContext('2d');
    var statusAreaY = getCurrentLevel().field.length * 68 + 10;
    var statusAreaX = getCurrentLevel().field[0].length * 68;

    context.clearRect(0, 0, elementsCanvas.width, elementsCanvas.height);

    getCurrentLevel().field.forEach(function (line, lineIndex) {
        line.forEach(function (tile, tileIndex) {
            var item = getCurrentLevel().items[lineIndex][tileIndex];
            drawTileItem(context, tile, item, tileIndex * 68 + 1, lineIndex * 68 + 1);
        });
    });
}

function createImageReferences() {
    images.button = document.getElementById('button_img');
    images.chest = document.getElementById('chest_img');
    images.door_red = document.getElementById('door_red_img');
    images.door_red_open = document.getElementById('door_red_open_img');
    images.door_green = document.getElementById('door_green_img');
    images.door_green_open = document.getElementById('door_green_open_img');
    images.door_blue = document.getElementById('door_blue_img');
    images.door_blue_open = document.getElementById('door_blue_open_img');
    images.key_red = document.getElementById('key_red_img');
    images.key_green = document.getElementById('key_green_img');
    images.key_blue = document.getElementById('key_blue_img');
    images.robot = {
        default: document.getElementById('robot_img'),
        animations: {
            push: [
                document.getElementById('robot_animations_push_0'),
                document.getElementById('robot_animations_push_1'),
                document.getElementById('robot_animations_push_2'),
                document.getElementById('robot_animations_push_3'),
                document.getElementById('robot_animations_push_4'),
                document.getElementById('robot_animations_push_3'),
                document.getElementById('robot_animations_push_2'),
                document.getElementById('robot_animations_push_1'),
                document.getElementById('robot_animations_push_0')
            ]
        }
    };
}

function createPlayer(startCoordinates) {
    robot = {
        speed: 2,
        currentTileCoords: function () {
            return {
                x: robot.x / 100 | 0,
                y: robot.y / 100 | 0
            };
        },
        getImage: function () {
            if (robot.animation) {
                return images.robot.animations[robot.animation][robot.animationFrame];
            } else {
                return images.robot.default;
            }
        },
        animate: function (animation) {
            robot.animation = animation;
            (function nextFrame() {
                setTimeout(function () {
                    if (robot.animationFrame < images.robot.animations[robot.animation].length - 1) {
                        robot.animationFrame++;
                        nextFrame();
                    } else {
                        robot.animationFrame = 0;
                        robot.animation = '';
                    }
                }, 50);
            })();
        },
        isAnimating: function () {
            return robot.animation !== '';
        }
    };
    setRobotInitialValues({x: 0, y: 0});
}

function prepareToPlay() {
    setRobotInitialValues(getStartPosition());
    resetItems();
    clearRobot();
    drawGameArea();
    drawDynamicGameElements();
    setPageElementsToInitialState();
}

function setRobotInitialValues(coords) {
    robot.renderTop = 6 + coords.y * 68;
    robot.renderLeft = 6 + coords.x * 68;
    robot.x = coords.x * 100;
    robot.y = coords.y * 100;
    robot.dx = 0;
    robot.dy = 0;
    robot.animation = '';
    robot.animationFrame = 0;
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
        robot.animate('push');
        setTimeout(triggerAction, 250);
        // The animation should take 450 ms, but usually takes a little bit
        // longer. Using 440 for the timeout we can be sure the animation is on
        // its last frame, but has not yet completed
        setTimeout(function () { robot.instructionCompleted = true; }, 440);
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
        renderQueue.push("LEDS");
    }

    function robotPushAnimationWithTriggerAction() {
        robotPushAnimation(robotPushAnimationTriggerAction);
    }

    handleInstruction(robot, program, memory, robotPushAnimationWithTriggerAction, setStatusMessage, addToRenderQueue);

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

function render() {
    function drawStatusMessage(statusMessage, context, x, y) {
        context.fillStyle = 'white';
        context.fillRect(x + 4, y + 1, 292, 26);

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

        context.drawImage(images['key_' + color], x, y);
    }

    var statusAreaY = getCurrentLevel().field.length * 68 + 10;
    var statusAreaX = getCurrentLevel().field[0].length * 68;
    var context = elementsCanvas.getContext('2d');
    if (renderQueue.length) {
        switch (renderQueue.shift()) {
            case "STATUS_MESSAGE":
                drawStatusMessage(getStatusMessage(), context, 4, statusAreaY + 2);
                break;
            case "LEDS":
                drawLEDs(getCurrentLevel().leds.length, context, statusAreaX - 12, statusAreaY + 16);
                break;
            case "KEYS":
                drawKey(context, robot.key, 309, statusAreaY + 5);
                break;
            case "DOORS":
            case "CHESTS":
                drawDynamicGameElements();
                drawLEDs(getCurrentLevel().leds.length, context, statusAreaX - 12, statusAreaY + 16);
                drawKey(context, robot.key, 309, statusAreaY + 5);
                break;
        }
    }

    var robotContext = robotCanvas.getContext('2d');
    robotContext.clearRect(robot.renderLeft, robot.renderTop, 57, 57);
    // The robot takes 100 steps when moving from one map tile to the next
    // Each map tile is 68 x 68 pixels
    // So each robot step is 68/100 pixels
    robot.renderLeft = 6 + Math.round(robot.x * 68 / 100);
    robot.renderTop = 6 + Math.round(robot.y * 68 / 100);
    robotContext.drawImage(robot.getImage(), robot.renderLeft, robot.renderTop);
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

