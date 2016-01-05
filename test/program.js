eval(require('fs').readFileSync('program.js', 'utf8'));

describe('Program', function () {
    describe('.nextInstruction()', function () {
        it('can return the next instruction', function () {
            var program = new Program(['ret 3', 'ret 2', 'add']);

            expect(program.nextInstruction()).toEqual('ret 3');
            expect(program.nextInstruction()).toEqual('ret 2');
            expect(program.nextInstruction()).toEqual('add');
        });

        it('returns undefined when there are no more instructions', function () {
            var program = new Program(['ret 1']);

            expect(program.nextInstruction()).toEqual('ret 1');
            expect(program.nextInstruction()).toEqual(undefined);
            expect(program.nextInstruction()).toEqual(undefined);
        });

        it('moves the instruction pointer when getting the next instruction', function () {
            var program = new Program(['ret 1']);

            var initialInstructionPointer = program.getInstructionPointer();
            program.nextInstruction();
            expect(program.getInstructionPointer()).toEqual(initialInstructionPointer + 1);
        });

        it('lets one set the instruction pointer', function () {
            var program = new Program(['ret 1', 'ret 2']);

            var initialInstructionPointer = program.getInstructionPointer();
            var firstInstruction = program.nextInstruction();
            var instructionPointerToFirstInstruction = program.getInstructionPointer();
            var secondInstruction = program.nextInstruction();
            var instructionPointerToSecondInstruction = program.getInstructionPointer();
            expect(program.getInstructionPointer()).not.toEqual(instructionPointerToFirstInstruction);
            program.setInstructionPointer(initialInstructionPointer);
            expect(program.nextInstruction()).toEqual(firstInstruction);
            expect(program.getInstructionPointer()).toEqual(instructionPointerToFirstInstruction);
            expect(program.nextInstruction()).toEqual(secondInstruction);
            expect(program.getInstructionPointer()).toEqual(instructionPointerToSecondInstruction);
        });
    });
});
