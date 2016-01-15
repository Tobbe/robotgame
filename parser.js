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

        this.tokenizer.getNextToken(); // Prep tokenizer for parsing expression
        var expression = this.parseExpression();

        token = this.tokenizer.getCurrentToken();
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

        return new ConditionalStatement(expression, ifMethodBlock);
    }
};

Parser.prototype.parseLoopStatement = function () {
    var token = this.tokenizer.getCurrentToken();
    var methodBlock;
    var expression;

    if (token !== 'loop') {
        return;
    }

    token = this.tokenizer.getNextToken();
    if (token !== '{' && token !== '(') {
        this.addError('Missing "{" or "("');
        return null;
    }

    if (token === '(') {
        this.tokenizer.getNextToken(); // Prep tokenizer for parsing expression
        expression = this.parseExpression();

        token = this.tokenizer.getCurrentToken();
        if (token !== ')') {
            this.addError('Missing ")"');
            return null;
        }

        token = this.tokenizer.getNextToken(); // Eat '{'
    }

    if (token !== '{') {
        this.addError('Missing "{"');
        return null;
    }

    methodBlock = this.parseMethodBlock();

    return new LoopStatement(expression, methodBlock);
};

Parser.prototype.parseMethodBlock = function () {
    var token = this.tokenizer.getCurrentToken();
    var methodInvocations = [];

    while ((token = this.tokenizer.getNextToken()) !== '}') {
        if (!token) {
            this.addError('Missing "}"');
            break;
        }

        var instruction = this.parseMethodInvocation();

        if (!instruction) {
            instruction = this.parseConditionalStatement();
        }

        if (!instruction) {
            instruction = this.parseLoopStatement();
        }

        methodInvocations.push(instruction);
    }

    return new MethodBlock(methodInvocations);
};

Parser.prototype.parseNumber = function () {
    return new NumberAtom(+this.tokenizer.getCurrentToken());
};

Parser.prototype.parseExpression = function () {
    function lastInArray(array) {
        return array[array.length - 1];
    }

    function isAddSubOperator(token) {
        return token === '+' || token === '-';
    }
    
    function isMulDivOperator(token) {
        return token === '*' || token === '/';
    }

    function isParentheses(token) {
        return token === '(' || token === ')';
    }

    function isComparisonOperator(token) {
        return token === '<' || token === '>' || token === '<=' || token === '>=' || token === '==';
    }

    function isOperator(token) {
        return isAddSubOperator(token) ||
            isMulDivOperator(token) ||
            isParentheses(token) ||
            isComparisonOperator(token);
    }

    function getOperatorPrecedence(token) {
        if (isComparisonOperator(token)) {
            return 1;
        } else if (isAddSubOperator(token)) {
            return 2;
        } else if (isMulDivOperator(token)) {
            return 3;
        } else if (token === ')') {
            return -1;
        } else if (token === '(') {
            return -2;
        }
    }

    function lessOrEqualPrecedence(operator1, operator2) {
        return getOperatorPrecedence(operator1) <=
            getOperatorPrecedence(operator2);
    }

    function finalExpression(operators, operands) {
        while (operators.length) {
            rhs = operands.pop();
            lhs = operands.pop();
            operands.push(new ParseExpression(operators.pop(), lhs, rhs));
        }

        return operands[0];
    }

    var token = this.tokenizer.getCurrentToken();
    var operands = [];
    var operators = [];
    var lhs;
    var rhs;
    var openParentheses = 0;

    while (true) {
        if (token === '(') {
            openParentheses++;
        } else if (token === ')') {
            openParentheses--;

            if (openParentheses < 0) {
                return finalExpression(operators, operands);
            }
        }

        if (token === 'robot') {
            operands.push(this.parseMethodInvocation());
        } else if (!isNaN(+token)) {
            operands.push(this.parseNumber());
        } else if (isOperator(token)) {
            while (operands.length > 1 && token !== '(' &&
                    lessOrEqualPrecedence(token, lastInArray(operators))) {
                rhs = operands.pop();
                lhs = operands.pop();
                operands.push(new ParseExpression(operators.pop(), lhs, rhs));
            }

            if (token === ')') {
                operators.pop();
            } else {
                operators.push(token);
            }
        } else if (token === undefined) {
            return finalExpression(operators, operands);
        }

        token = this.tokenizer.getNextToken();
    }
};

Parser.prototype.parseFunctionDefinition = function () {
    var token = this.tokenizer.getCurrentToken();

    if (token !== 'function') {
        return;
    }

    var functionName = this.tokenizer.getNextToken();
    token = this.tokenizer.getNextToken(); // Eat '{'
    if (token !== '{') {
        this.addError('Missing "{"');
        return null;
    }

    var functionMethodBlock = this.parseMethodBlock();

    if (!functionMethodBlock) {
        this.addError('Missing function method block');
    }

    return new FunctionDefinition(functionName, functionMethodBlock);
};

Parser.prototype.parseFunctionCall = function () {
    var functionName = this.tokenizer.getCurrentToken();

    token = this.tokenizer.getNextToken(); // Eat '('
    if (token !== '(') {
        this.addError('parseFunctionCall: Missing "("');
        return null;
    }

    token = this.tokenizer.getNextToken(); // Eat ')'
    if (token !== ')') {
        this.addError('parseFunctionCall: Missing ")"');
        return null;
    }

    return new FunctionCall(functionName);
};

Parser.prototype.addError = function (errorMessage) {
    this.errors.push(errorMessage);
};

Parser.prototype.getErrors = function () {
    return this.errors;
};
