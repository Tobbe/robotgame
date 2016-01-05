function standingOnClosedDoor(robot) {
    var tileCoords = robot.currentTileCoords();
    var item = getCurrentLevel().items[tileCoords.y][tileCoords.x];
    var closedDoor = false;

    if (item && item.key === 'doors') {
        closedDoor = !getCurrentLevel().doors[item.index].open;
    }

    return closedDoor;
}

function movingThroughWall(robot, direction) {
    var tileCoords = robot.currentTileCoords();
    var tile = getCurrentLevel().field[tileCoords.y][tileCoords.x];
    var tileOpenings = parseInt(tile[0], 16);

    switch (direction) {
        case 'up':    return !(tileOpenings & 1);
        case 'right': return !(tileOpenings & 2);
        case 'down':  return !(tileOpenings & 4);
        case 'left':  return !(tileOpenings & 8);
    }
}

function robotIsMoving(robot) {
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

var item;
var lhs;
var rhs;

function handleInstruction(robot, program, memory, robotPushAnimation, drawPlayingField, setStatusMessage) {
    var instruction = (robot.currentInstruction || '').split(' ');
    var tileCoords;

    switch (instruction[0]) {
        case 'right':
        case 'left':
        case 'down':
        case 'up':
            if (!robotIsMoving(robot)) {
                if (movingThroughWall(robot, instruction[0])) {
                    setStatusMessage("You can't walk through walls");
                    robot.currentInstruction = program.nextInstruction();
                    return;
                } else if (standingOnClosedDoor(robot)) {
                    setStatusMessage("You banged straight in to a closed door");
                    robot.currentInstruction = program.nextInstruction();
                    return;
                }

                switch (instruction[0]) {
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
                tileCoords = robot.currentTileCoords();
                item = getCurrentLevel().items[tileCoords.y][tileCoords.x];
                if (item && item.key === 'buttons') {
                    robotPushAnimation();
                } else {
                    setStatusMessage("No button found here");
                    robot.instructionCompleted = true;
                }
            }
            break;
        case 'openChest':
            var keys = ['red', 'green', 'blue'];
            var foundKey = keys[Math.floor(Math.random() * keys.length)];
            tileCoords = robot.currentTileCoords();
            item = getCurrentLevel().items[tileCoords.y][tileCoords.x];
            if (item && item.key === 'chests') {
                var chest = getCurrentLevel().chests[item.index];
                if (!chest.open) {
                    chest.open = true;
                    robot.key = foundKey;
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
            tileCoords = robot.currentTileCoords();
            var tile = getCurrentLevel().field[tileCoords.y][tileCoords.x];
            item = getCurrentLevel().items[tileCoords.y][tileCoords.x];
            if (item && item.key === 'doors') {
                var door = getCurrentLevel().doors[item.index];

                if (tile[1] === 'D' && robot.key === 'red' ||
                        tile[1] === 'E' && robot.key === 'green' ||
                        tile[1] === 'F' && robot.key === 'blue') {
                    door.open = true;
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
            memory.retVal.push(robot.key === 'red');
            robot.currentInstruction = program.nextInstruction();
            return;
        case 'hasGreenKey':
            memory.retVal.push(robot.key === 'green');
            robot.currentInstruction = program.nextInstruction();
            return;
        case 'hasBlueKey':
            memory.retVal.push(robot.key === 'blue');
            robot.currentInstruction = program.nextInstruction();
            return;
        case 'cond':
            if (memory.retVal[memory.retVal.length - 1]) {
                var trueJumpTarget = program.getInstructionPointer() +
                    parseInt(instruction[1]);
                program.setInstructionPointer(trueJumpTarget - 1);
            }

            robot.currentInstruction = program.nextInstruction();

            return;
        case 'lbl':
            memory.lbl[instruction[1]] = program.getInstructionPointer();
            robot.currentInstruction = program.nextInstruction();
            return;
        case 'jmp':
            program.setInstructionPointer(memory.lbl[instruction[1]] - 1);
            robot.currentInstruction = program.nextInstruction();
            return;
        case 'jmpr':
            var jumpTarget = program.getInstructionPointer() +
                parseInt(instruction[1]);
            program.setInstructionPointer(jumpTarget - 1);
            robot.currentInstruction = program.nextInstruction();
            return;
        case 'count':
            memory.count++;
            robot.currentInstruction = program.nextInstruction();
            return;
        case 'getCount':
            memory.retVal.push(memory.count);
            robot.currentInstruction = program.nextInstruction();
            return;
        case 'ret':
            memory.retVal.push(instruction[1]);
            return;
        case 'add':
            rhs = memory.retVal.pop();
            lhs = memory.retVal.pop();
            memory.retVal.push(lsh + rhs);
            return;
        case 'lt':
            rhs = memory.retVal.pop();
            lhs = memory.retVal.pop();
            memory.retVal.push(lhs < rhs);
            return;
    }
}
