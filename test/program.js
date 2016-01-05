eval(require('fs').readFileSync('program.js', 'utf8'));

describe('Program', function () {
    describe('.nextInstruction()', function () {
        it('can return the next instruction', function () {
            function Ast(instructions) {
                this.instructions = instructions;
            }

            Ast.prototype.toArray = function () {
                return this.instructions;
            };

            var ast = new Ast(['ret 3', 'ret 2', 'add']);
            var program = new Program(ast);

            expect(program.nextInstruction()).toEqual('ret 3');
            expect(program.nextInstruction()).toEqual('ret 2');
            expect(program.nextInstruction()).toEqual('add');
        });

        it('returns undefined when there are no more instructions', function () {
            function Ast(instructions) {
                this.instructions = instructions;
            }

            Ast.prototype.toArray = function () {
                return this.instructions;
            };

            var ast = new Ast(['ret 1']);
            var program = new Program(ast);

            expect(program.nextInstruction()).toEqual('ret 1');
            expect(program.nextInstruction()).toEqual(undefined);
            expect(program.nextInstruction()).toEqual(undefined);
        });

        it('moves the instruction pointer when getting the next instruction', function () {
            function Ast(instructions) {
                this.instructions = instructions;
            }

            Ast.prototype.toArray = function () {
                return this.instructions;
            };

            var ast = new Ast(['ret 1']);
            var program = new Program(ast);

            var initialInstructionPointer = program.getInstructionPointer();
            program.nextInstruction();
            expect(program.getInstructionPointer()).toEqual(initialInstructionPointer + 1);
        });
    });
});
