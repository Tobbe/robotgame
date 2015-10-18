var robot;
var now;
var deltaTime;
var last = timestamp();
var frameId;


$(function () {
    attachClickHandlers();
    createPlayer();
});

function createPlayer() {
    robot = $('<img src="robot.png" class="player">');
    robot.css('top', 6);
    robot.css('left', 6);
    $('.field').append(robot);
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
            nextDirection.prototype.stepArray.push(line);
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

    if ((position.left - 6) % 68 === 0 && (position.top - 6) % 68 === 0) {
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
