function Program(ast) {
    this.instructionArray = ast.toArray();
    this.instructionPointer = -1;
}

Program.prototype.nextInstruction = function () {
    return this.instructionArray[++this.instructionPointer];
};

Program.prototype.getInstructionPointer = function () {
    return this.instructionPointer;
};

Program.prototype.setInstructionPointer = function (instructionPointer) {
    this.instructionPointer = instructionPointer - 1;
};
