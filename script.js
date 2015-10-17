var robot;

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
        run();
    });
}

function run() {
    var script = $('textarea').val();
    var lines = script.split('\n');

    lines.forEach(function (line) {
        var position = robot.position();
        switch (line) {
            case 'right':
                robot.css('left', position.left + 68);
                break;
            case 'down':
                robot.css('top', position.top + 68);
                break;
        }
    });
}
