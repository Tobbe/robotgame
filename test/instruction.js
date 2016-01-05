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

    it('can calculate the result of a simple subtraction expression', function () {
        executeInstructions(['ret 3', 'ret 2', 'sub']);
        expect(memory.retVal[memory.retVal.length - 1]).toEqual(1);
    });

    it('can calculate the result of a simple multiplication expression', function () {
        executeInstructions(['ret 3', 'ret 2', 'mul']);
        expect(memory.retVal[memory.retVal.length - 1]).toEqual(6);
    });

    it('can calculate the result of a simple division expression', function () {
        executeInstructions(['ret 6', 'ret 2', 'div']);
        expect(memory.retVal[memory.retVal.length - 1]).toEqual(3);
    });

    it('can check if one number is less or equal to another', function () {
        executeInstructions(['ret 5', 'ret 13', 'lte']);
        expect(memory.retVal[memory.retVal.length - 1]).toBe(true);

        executeInstructions(['ret 7', 'ret 7', 'lte']);
        expect(memory.retVal[memory.retVal.length - 1]).toBe(true);

        executeInstructions(['ret 7', 'ret 5', 'lte']);
        expect(memory.retVal[memory.retVal.length - 1]).toBe(false);
    });

    it('can check if one number is greater than another', function () {
        executeInstructions(['ret 15', 'ret 3', 'gt']);
        expect(memory.retVal[memory.retVal.length - 1]).toBe(true);

        executeInstructions(['ret 7', 'ret 7', 'gt']);
        expect(memory.retVal[memory.retVal.length - 1]).toBe(false);

        executeInstructions(['ret 7', 'ret 77', 'gt']);
        expect(memory.retVal[memory.retVal.length - 1]).toBe(false);
    });

    it('can check if one number is greater than, or equal to, another number', function () {
        executeInstructions(['ret 15', 'ret 3', 'gte']);
        expect(memory.retVal[memory.retVal.length - 1]).toBe(true);

        executeInstructions(['ret 7', 'ret 7', 'gte']);
        expect(memory.retVal[memory.retVal.length - 1]).toBe(true);

        executeInstructions(['ret 7', 'ret 77', 'gte']);
        expect(memory.retVal[memory.retVal.length - 1]).toBe(false);
    });

    it('can check if one number is equal to another', function () {
        executeInstructions(['ret 0', 'ret 0', 'eq']);
        expect(memory.retVal[memory.retVal.length - 1]).toBe(true);

        executeInstructions(['ret 7', 'ret 7', 'eq']);
        expect(memory.retVal[memory.retVal.length - 1]).toBe(true);

        executeInstructions(['ret 7', 'ret 77', 'eq']);
        expect(memory.retVal[memory.retVal.length - 1]).toBe(false);
    });

    it('can count, and return the count value', function () {
        executeInstructions(['count', 'count', 'count', 'getCount']);
        expect(memory.retVal[memory.retVal.length - 1]).toBe(3);
    });

    it('can compare the count with a math expression', function () {
        executeInstructions([
            'count',
            'count',
            'getCount',
            'ret 15',
            'ret 5',
            'div',
            'ret 1',
            'sub',
            'lte']);
        expect(memory.retVal[memory.retVal.length - 1]).toBe(true);
    });
});
