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
 * A = Button
 * B = Chest
 * C = Red Door
 * D = Green Door
 * E = Blue Door
 */
var field = [
    ['4-', '0-', '6-', 'AC', 'C-', '0-'],
    ['3A', 'AB', 'F-', 'AD', 'F-', 'C-'],
    ['0-', '0-', '3-', 'AE', '9-', '5-'],
    ['0-', '0-', '0-', '0-', '0-', '5-'],
    ['0-', '0-', '0-', '0-', '0-', '5-'],
    ['0-', '0-', '0-', '0-', '0-', '1A']];

$(function () {
    attachClickHandlers();
    drawPlayingField();
    createPlayer();
});

function drawPlayingField() {
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

        if (tile[1] === 'A') {
            drawItem('button', x, y);
        }

        if (tile[1] === 'B') {
            drawItem('chest', x, y);
        }

        if (tile[1] === 'C') {
            drawItem('door_red', x, y);
        }

        if (tile[1] === 'D') {
            drawItem('door_green', x, y);
        }

        if (tile[1] === 'E') {
            drawItem('door_blue', x, y);
        }

        context.stroke();
    }

    var context = $('.field')[0].getContext('2d');
    context.lineWidth = 2;

    field.forEach(function (line, lineIndex) {
        line.forEach(function (tile, tileIndex) {
            drawTile(context, tile, tileIndex * 68 + 1, lineIndex * 68 + 1);
        });
    });
}

function createPlayer() {
    robot = $('<img src="robot.png" class="player">');
    robot.css('top', 6);
    robot.css('left', 6);
    robot.dx = 0;
    robot.dy = 0;
    robot.x = 0;
    robot.y = 0;
    robot.speed = 2;
    $('.game_area').append(robot);
}

function attachClickHandlers() {
    $('input').on('click', function() {
        robot.currentInstruction = nextInstruction();
        requestAnimationFrame(frame);
    });
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
            }
        });
    }

    return nextInstruction.instructionArray.shift();
}

function update(deltaTime) {
    function move() {
        robot.x += robot.dx * robot.speed;
        robot.y += robot.dy * robot.speed;

        if (robot.x % 100 === 0 && robot.y % 100 === 0) {
            robot.dx = 0;
            robot.dy = 0;
            robot.instructionCompleted = true;
        }
    }

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
            console.log('Turn LED on');
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
            robot.currentInstruction = nextInstruction();
            robot.instructionCompleted = false;
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
    update(deltaTime);
    render(deltaTime);
    last = now;

    requestAnimationFrame(frame);
}
