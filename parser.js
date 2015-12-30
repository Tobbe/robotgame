function Parser(tokenizer) {
    this.tokenizer = tokenizer;
    this.errors = [];
}

Parser.prototype.parseMethodInvocation = function () {
    var token = this.tokenizer.getCurrentToken();

    if (token === 'robot') {
        if (this.tokenizer.getNextToken() !== '.') {
            this.addError('Missing "."');
            return null;
        }

        var methodName = this.tokenizer.getNextToken();
        token = this.tokenizer.getNextToken(); // Eat '('
        if (token !== '(') {
            this.addError('Missing "("');
            return MethodInvocation.create(methodName, []);
        }

        var args = [];
        while ((token = this.tokenizer.getNextToken()) != ')') {
            if (!token) {
                this.addError('Missing ")"');
                break;
            }

            args.push(token);
        }

        return MethodInvocation.create(methodName, args);
    }
};

Parser.prototype.parseConditionalStatement = function () {
    var token = this.tokenizer.getCurrentToken();

    if (token === 'if') {
        if (this.tokenizer.getNextToken() !== '(') {
            this.addError('Missing "("');
            return null;
        }

        this.tokenizer.getNextToken(); // Prep tokenizer for parsing method invocation
        var methodInvocation = this.parseMethodInvocation();

        token = this.tokenizer.getNextToken(); // Eat ')'
        if (token !== ')') {
            this.addError('Missing ")"');
            return null;
        }

        token = this.tokenizer.getNextToken(); // Eat '{'
        if (token !== '{') {
            this.addError('Missing "{"');
            return null;
        }

        var ifMethodBlock = this.parseMethodBlock();
        if (!ifMethodBlock) {
            this.addError('Missing "if" method block');
        }

        return new ConditionalStatement(methodInvocation, ifMethodBlock);
    }
};

Parser.prototype.parseLoopStatement = function () {
    var token = this.tokenizer.getCurrentToken();
    var methodBlock;

    if (token === 'loop') {
        if (this.tokenizer.getNextToken() !== '{') {
            this.addError('Missing "{"');
            return null;
        }

        methodBlock = this.parseMethodBlock();
    }

    return new LoopStatement(methodBlock);
};

Parser.prototype.parseMethodBlock = function () {
    var token = this.tokenizer.getCurrentToken();
    var methodInvocations = [];

    while ((token = this.tokenizer.getNextToken()) !== '}') {
        if (!token) {
            this.addError('Missing "}"');
            break;
        }

        methodInvocations.push(this.parseMethodInvocation());
    }

    return new MethodBlock(methodInvocations);
};

Parser.prototype.parseExpression = function () {
    function isMathOperator(token) {
        return token === '+' || token === '-' || token === '*' || token === '/';
    }

    function isComparisonOperator(token) {
        return token === '<' || token === '>' || token === '<=' || token === '>=' || token === '==';
    }

    var token = this.tokenizer.getCurrentToken();
    var lhs;

    if (token === 'robot.') {
        lhs = this.parseMethodInvocation();
    } else if (!isNaN(+token)) {
        lhs = this.parseNumber();
    } else if (isMathOperator(token) || isComparisonOperator(token)) {
        return new ParseExpression(token, lhs, this.parseExpression());
    } else if (token === ')') {
    }
};

Parser.prototype.addError = function (errorMessage) {
    this.errors.push(errorMessage);
};

Parser.prototype.getErrors = function () {
    return this.errors;
};
