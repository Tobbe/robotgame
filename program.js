function Program(instructionArray) {
    this.instructionArray = instructionArray;
    this.instructionPointer = -1;
    this.functions = {};
    this.functionCreationStack = [];
}

Program.prototype.nextInstruction = function () {
    return this.instructionArray[++this.instructionPointer];
};

Program.prototype.getInstructionPointer = function () {
    return this.instructionPointer;
};

Program.prototype.setInstructionPointer = function (instructionPointer) {
    this.instructionPointer = instructionPointer;
};

Program.prototype.createFunction = function (name) {
    this.functions[name] = [];
    this.functionCreationStack.push(name);
};

Program.prototype.endCreateFunction = function () {
    this.functionCreationStack.pop();
};

Program.prototype.addToFunction = function (instruction) {
    var currentFunctionName =
        this.functionCreationStack[this.functionCreationStack.length - 1];
    this.functions[currentFunctionName].push(instruction);
};

Program.prototype.isCreatingFunction = function () {
    return this.functionCreationStack.length;
};
