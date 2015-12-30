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
});
