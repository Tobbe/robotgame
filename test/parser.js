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

    it('can parse loop statements with simple expression', function () {
        var program =
            "loop (1 == 1) {\n" +
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
            'lbl loop_statement_2',
            'ret 1',
            'ret 1',
            'eq',
            'cond 2',
            'jmpr 6',
            'right',
            'right',
            'up',
            'pushButton',
            'jmp loop_statement_2']);
    });

    it('can parse expressions with just a method invocation', function () {
        var tokenizer = new Tokenizer("robot.moveRight()");
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var expression = parser.parseExpression();
        var expressionArray = expression.toArray();
        expect(expressionArray).toEqual(['right']);
    });

    it('can parse simple addition expressions', function () {
        var tokenizer = new Tokenizer("1 + 1");
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var expression = parser.parseExpression();
        var expressionArray = expression.toArray();
        expect(expressionArray).toEqual(['ret 1', 'ret 1', 'add']);
    });

    it('can parse simple addition expressions with method invocations', function () {
        var tokenizer = new Tokenizer("1 + robot.getCount()");
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var expression = parser.parseExpression();
        var expressionArray = expression.toArray();
        expect(expressionArray).toEqual(['ret 1', 'getCount', 'add']);
    });

    it('can parse simple addition expressions with method invocations - reversed', function () {
        var tokenizer = new Tokenizer("robot.getCount() + 1");
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var expression = parser.parseExpression();
        var expressionArray = expression.toArray();
        expect(expressionArray).toEqual(['getCount', 'ret 1', 'add']);
    });

    it('can parse addition expressions', function () {
        var tokenizer = new Tokenizer("3 + 2 + 1");
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var expression = parser.parseExpression();
        var expressionArray = expression.toArray();
        expect(expressionArray).toEqual(['ret 3', 'ret 2', 'add', 'ret 1', 'add']);
    });

    it('can parse subtraction expressions with method invocations', function () {
        var tokenizer = new Tokenizer("3 - robot.getCount() - 1");
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var expression = parser.parseExpression();
        var expressionArray = expression.toArray();
        expect(expressionArray).toEqual(['ret 3', 'getCount', 'sub', 'ret 1', 'sub']);
    });

    it('can parse simple division expressions', function () {
        var tokenizer = new Tokenizer("4 / 2");
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var expression = parser.parseExpression();
        var expressionArray = expression.toArray();
        expect(expressionArray).toEqual(['ret 4', 'ret 2', 'div']);
    });

    it('can parse multiplication expressions with several multiplications', function () {
        var tokenizer = new Tokenizer("1 * 2 * 3 * 4");
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var expression = parser.parseExpression();
        var expressionArray = expression.toArray();
        expect(expressionArray).toEqual(['ret 1', 'ret 2', 'mul', 'ret 3', 'mul', 'ret 4', 'mul']);
    });

    it('can parse multiplication expressions with additions: 1 + 2 * 3', function () {
        var tokenizer = new Tokenizer("1 + 2 * 3");
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var expression = parser.parseExpression();
        var expressionArray = expression.toArray();
        expect(expressionArray).toEqual(['ret 1', 'ret 2', 'ret 3', 'mul', 'add']);
    });

    it('can parse expressions with several multiplications and subtractions: 1 - 2 * 3 - 4 - 5 * 6 * 7 - 8', function () {
        var tokenizer = new Tokenizer("1 - 2 * 3 - 4 - 5 * 6 * 7 - 8");
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var expression = parser.parseExpression();
        var expressionArray = expression.toArray();
        expect(expressionArray).toEqual([
            'ret 1',
            'ret 2',
            'ret 3',
            'mul',
            'sub',
            'ret 4',
            'sub',
            'ret 5',
            'ret 6',
            'mul',
            'ret 7',
            'mul',
            'sub',
            'ret 8',
            'sub']);
    });

    it('can parse "greater than" comparison expressions', function () {
        var tokenizer = new Tokenizer("1 > 2");
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var expression = parser.parseExpression();
        var expressionArray = expression.toArray();
        expect(expressionArray).toEqual(['ret 1', 'ret 2', 'gt']);
    });

    it('can parse "less than or equal" comparison expressions', function () {
        var tokenizer = new Tokenizer("1 <= 2");
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var expression = parser.parseExpression();
        var expressionArray = expression.toArray();
        expect(expressionArray).toEqual(['ret 1', 'ret 2', 'lte']);
    });

    it('can parse "equal" comparison expressions with calculations: 1 + 2 + 3 * 4 == 1 - 5 * 4 / 3 - 1', function () {
        var tokenizer = new Tokenizer("1 + 2 + 3 * 4 == 1 - 5 * 4 / 3 - 1");
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var expression = parser.parseExpression();
        var expressionArray = expression.toArray();
        expect(expressionArray).toEqual([
            'ret 1',
            'ret 2',
            'add',
            'ret 3',
            'ret 4',
            'mul',
            'add',
            'ret 1',
            'ret 5',
            'ret 4',
            'mul',
            'ret 3',
            'div',
            'sub',
            'ret 1',
            'sub',
            'eq']);
    });

    it('can parse simple expressions with parantheses', function () {
        var tokenizer = new Tokenizer("(1 + 2)");
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var expression = parser.parseExpression();
        var expressionArray = expression.toArray();
        expect(expressionArray).toEqual(['ret 1', 'ret 2', 'add']);
    });

    it('can parse expressions with parantheses: 2 / (6 - 4)', function () {
        var tokenizer = new Tokenizer("2 / (6 - 4)");
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var expression = parser.parseExpression();
        var expressionArray = expression.toArray();
        expect(expressionArray).toEqual(['ret 2', 'ret 6', 'ret 4', 'sub', 'div']);
    });

    it('can parse expressions with nested parantheses', function () {
        var tokenizer = new Tokenizer("2 / (6 + (8 - 4))");
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var expression = parser.parseExpression();
        var expressionArray = expression.toArray();
        expect(expressionArray).toEqual(['ret 2', 'ret 6', 'ret 8', 'ret 4', 'sub', 'add', 'div']);
    });

    it('can parse comparison expressions with parantheses', function () {
        var tokenizer = new Tokenizer("2 <= (6 - 4) * 2");
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var expression = parser.parseExpression();
        var expressionArray = expression.toArray();
        expect(expressionArray).toEqual(['ret 2', 'ret 6', 'ret 4', 'sub', 'ret 2', 'mul', 'lte']);
    });

    it('can parse division expressions with parantheses', function () {
        var tokenizer = new Tokenizer("27 / (9 / 3)");
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var expression = parser.parseExpression();
        var expressionArray = expression.toArray();
        expect(expressionArray).toEqual(['ret 27', 'ret 9', 'ret 3', 'div', 'div']);
    });

    it('can parse expressions with several operations in parantheses', function () {
        var tokenizer = new Tokenizer("27 / (6 - 9 / 3)");
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var expression = parser.parseExpression();
        var expressionArray = expression.toArray();
        expect(expressionArray).toEqual(['ret 27', 'ret 6', 'ret 9', 'ret 3', 'div', 'sub', 'div']);
    });

    it('can parse conditional statements with expressions', function () {
        var program =
            "if (3 > 1) {\n" +
            "    robot.moveRight();\n" +
            "}";
        var tokenizer = new Tokenizer(program);
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var conditionalStatement = parser.parseConditionalStatement();
        var conditionalArray = conditionalStatement.toArray();
        expect(conditionalArray).toEqual(['ret 3', 'ret 1', 'gt', 'cond 2', 'jmpr 2', 'right']);
    });

    it('can parse conditional statements with expressions with methods', function () {
        var program =
            "if (3 * 2 > robot.getCount()) {\n" +
            "    robot.moveRight();\n" +
            "}";
        var tokenizer = new Tokenizer(program);
        tokenizer.getNextToken();
        var parser = new Parser(tokenizer);
        var conditionalStatement = parser.parseConditionalStatement();
        var conditionalArray = conditionalStatement.toArray();
        expect(conditionalArray).toEqual(['ret 3', 'ret 2', 'mul', 'getCount', 'gt', 'cond 2', 'jmpr 2', 'right']);
    });
});
