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
    var position = robot.position();
    var speed = 2;

    if ((position.left - 6) % 68 === 0 && (position.top - 6) % 68 === 0) {
        switch (nextDirection()) {
            case 'right':
                robot['dx'] = 1;
                robot['dy'] = 0;
                break;
            case 'left':
                robot['dx'] = -1;
                robot['dy'] = 0;
                break;
            case 'down':
                robot['dx'] = 0;
                robot['dy'] = 1;
                break;
            case 'up':
                robot['dx'] = 0;
                robot['dy'] = -1;
                break;
            default:
                robot['dx'] = 0;
                robot['dy'] = 0;
        }
    }
robot.css('left', position.left + robot.dx * speed); robot.css('top', position.top + robot.dy * speed); } function frame() { now = timestamp();
    // duration in seconds, maximum 1 sec
    deltaTime = Math.min(1, (now - last) / 1000);
    update(deltaTime);
    //render(deltaTime);
    last = now;

    requestAnimationFrame(frame);
}
