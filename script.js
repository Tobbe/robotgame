var robot;
var now;
var deltaTime;
var last = timestamp();
var frameId;

/**
 * 1 = Open top
 * 2 = Open right
 * 4 = Open down
 * 8 = Open left
 * 16 = Button
 */
var field = [
    ['04', '00', '06', '12', '00', '00'],
    ['19', '10', '09', '05', '00', '00'],
    ['00', '00', '00', '05', '00', '00'],
    ['00', '00', '00', '05', '00', '00'],
    ['00', '00', '00', '05', '00', '00'],
    ['00', '00', '00', '17', '00', '00']];


$(function () {
    attachClickHandlers();
    drawPlayingField();
    createPlayer();
});

function drawPlayingField() {
    function drawTile(context, type, x, y) {
        function drawButton(x, y) {
            console.log('x', x, 'y', y);
            var button = $('<img src="button.png" class="button"></img>');
            button.css('top', y + 20 + 10);
            button.css('left', x + 20 + 10);
            $('body').append(button);
        }

        if (type === 0) {
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

        if (type & 1) {
            context.moveTo(x + 4, y);
            context.lineTo(x + 64, y);
        }

        if (type & 2) {
            context.moveTo(x + 68, y + 4);
            context.lineTo(x + 68, y + 64);
        }

        if (type & 4) {
            context.moveTo(x + 4, y + 68);
            context.lineTo(x + 64, y + 68);
        }

        if (type & 8) {
            context.moveTo(x, y + 4);
            context.lineTo(x, y + 64);
        }

        if (type & 16) {
            drawButton(x, y);
        }

        context.stroke();
    }

    var context = $('.field')[0].getContext('2d');
    context.lineWidth = 2;

    field.forEach(function (line, lineIndex) {
        line.forEach(function (tile, tileIndex) {
            drawTile(context, parseInt(tile), tileIndex * 68 + 1, lineIndex * 68 + 1);
        });
    });
}

function createPlayer() {
    robot = $('<img src="robot.png" class="player">');
    robot.css('top', 26);
    robot.css('left', 26);
    $('body').append(robot);
}

function attachClickHandlers() {
    $('input').on('click', function() {
        frameId = requestAnimationFrame(frame);
    });
}

function timestamp() {
    return window.performance && window.performance.now ?
        window.performance.now() :
        new Date().getTime();
}

function nextDirection() {
    if (!nextDirection.prototype.stepArray) {
        var script = $('textarea').val();
        var lines = script.split('\n');
        nextDirection.prototype.stepArray = [];

        lines.forEach(function (line) {
            // A line will look something like `robot.moveDown(3);`
            var direction = line.substring(10, line.indexOf('(')).toLowerCase();
            var repetitions = line.substr(line.indexOf('(') + 1, 1);
            for (var i = 0; i < repetitions; i++) {
                nextDirection.prototype.stepArray.push(direction);
            }
        });
    }

    return nextDirection.prototype.stepArray.shift();
}

function update(deltaTime) {
    function setNewDirection() {
        switch (nextDirection()) {
            case 'right':
                robot.dx = 1;
                break;
            case 'left':
                robot.dx = -1;
                break;
            case 'down':
                robot.dy = 1;
                break;
            case 'up':
                robot.dy = -1;
                break;
            default:
        }
    }

    var position = robot.position();

    if ((position.left - 26) % 68 === 0 && (position.top - 26) % 68 === 0) {
        robot.dx = 0;
        robot.dy = 0;

        if (!robot.pause) {
            robot.pause = 500;
        }

        robot.pause -= deltaTime;

        if (robot.pause <= 0) {
            delete robot.pause;
            setNewDirection();
        }
    }
}

function render() {
    var position = robot.position();
    var speed = 2;
    robot.css('left', position.left + robot.dx * speed);
    robot.css('top', position.top + robot.dy * speed);
}

function frame() {
    now = timestamp();
    deltaTime = now - last;
    update(deltaTime);
    render(deltaTime);
    last = now;

    requestAnimationFrame(frame);
}
