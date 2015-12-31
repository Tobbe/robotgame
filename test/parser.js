eval(require('fs').readFileSync('tokenizer.js', 'utf8'));
eval(require('fs').readFileSync('ast.js', 'utf8')); // Mock this?
eval(require('fs').readFileSync('parser.js', 'utf8'));

describe('Parser', function () {
    it('can parse a method invocation', function () {
        var tokenizer = new Tokenizer("robot.methodName();");
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var methodInvocation = parser.parseMethodInvocation();
        var methodArray = methodInvocation.toArray();
        expect(methodArray.length).toEqual(1);
        expect(methodArray).toEqual(['methodName']);
    });

    it('can parse a "move" method invocation', function () {
        var tokenizer = new Tokenizer("robot.moveDown();");
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var methodInvocation = parser.parseMethodInvocation();
        var methodArray = methodInvocation.toArray();
        expect(methodArray.length).toEqual(1);
        expect(methodArray).toEqual(['down']);
    });

    it('can parse a "move" method invocation with repetition', function () {
        var tokenizer = new Tokenizer("robot.moveLeft(3);");
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var methodInvocation = parser.parseMethodInvocation();
        var methodArray = methodInvocation.toArray();
        expect(methodArray.length).toEqual(3);
        expect(methodArray).toEqual(['left', 'left', 'left']);
    });

    it('can parse conditional statements', function () {
        var program =
            "if (robot.hasRedKey()) {\n" +
            "    robot.moveRight();\n" +
            "}";
        var tokenizer = new Tokenizer(program);
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var conditionalStatement = parser.parseConditionalStatement();
        var conditionalArray = conditionalStatement.toArray();
        expect(conditionalArray).toEqual(['hasRedKey', 'cond 2', 'jmpr 2', 'right']);
    });

    it('can parse conditional statements with several statements in \"if\" method block', function () {
        var program =
            "if (robot.hasRedKey()) {\n" +
            "    robot.moveRight(2);\n" +
            "    robot.moveUp(1);\n" +
            "    robot.moveRight();\n" +
            "}";
        var tokenizer = new Tokenizer(program);
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var conditionalStatement = parser.parseConditionalStatement();
        var conditionalArray = conditionalStatement.toArray();
        expect(conditionalArray).toEqual(['hasRedKey', 'cond 2', 'jmpr 5', 'right', 'right', 'up', 'right']);
    });

    it('can parse loop statements', function () {
        var program =
            "loop {\n" +
            "    robot.moveRight(2);\n" +
            "    robot.moveUp(1);\n" +
            "    robot.pushButton();\n" +
            "}";
        var tokenizer = new Tokenizer(program);
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var loopStatement = parser.parseLoopStatement();
        var loopArray = loopStatement.toArray();
        expect(loopArray).toEqual([
            'lbl loop_statement_1',
            'right',
            'right',
            'up',
            'pushButton',
            'jmp loop_statement_1']);
    });
});
