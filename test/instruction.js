eval(require('fs').readFileSync('program.js', 'utf8'));
eval(require('fs').readFileSync('instruction.js', 'utf8'));

describe('Instruction', function () {
    var robot = {};
    var memory;
    var robotPushAnimation = function () {};
    var drawPlayingField = function () {};
    var setStatusMessage = function () {};

    beforeEach(function () {
        memory = {
            lbl: {},
            count: 0,
            retVal: []
        };
    });

    function executeInstructions(instructions) {
        var program = new Program(instructions);

        robot.currentInstruction = program.nextInstruction();
        for (var i = 0; i < instructions.length; ++i) {
            handleInstruction(robot, program, memory, robotPushAnimation, drawPlayingField, setStatusMessage);
        }
    }

    it('can calculate the result of a simple addition expression', function () {
        executeInstructions(['ret 3', 'ret 2', 'add']);
        expect(memory.retVal[memory.retVal.length - 1]).toEqual(5);
    });

    it('can check if one number is less than another', function () {
        executeInstructions(['ret 5', 'ret 13', 'lt']);
        expect(memory.retVal[memory.retVal.length - 1]).toBe(true);

        executeInstructions(['ret 7', 'ret 5', 'lt']);
        expect(memory.retVal[memory.retVal.length - 1]).toBe(false);

        executeInstructions(['ret 5', 'ret 5', 'lt']);
        expect(memory.retVal[memory.retVal.length - 1]).toBe(false);
    });

    it('can check if the result of one addition is less than that of another', function () {
        executeInstructions(['ret 5', 'ret 7', 'add', 'ret 33', 'ret 2', 'add', 'lt']);
        expect(memory.retVal[memory.retVal.length - 1]).toBe(true);

        executeInstructions(['ret 5', 'ret 7', 'add', 'ret 3', 'ret 2', 'add', 'lt']);
        expect(memory.retVal[memory.retVal.length - 1]).toBe(false);
    });
});
