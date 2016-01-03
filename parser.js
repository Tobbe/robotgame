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

    var token = this.tokenizer.getCurrentToken();
    var operands = [];
    var operators = [];
    var lhs;
    var rhs;

    while (true) {
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
            while (operators.length) {
                rhs = operands.pop();
                lhs = operands.pop();
                operands.push(new ParseExpression(operators.pop(), lhs, rhs));
            }

            return operands[0];
        }

        token = this.tokenizer.getNextToken();
    }
};

Parser.prototype.addError = function (errorMessage) {
    this.errors.push(errorMessage);
};

Parser.prototype.getErrors = function () {
    return this.errors;
};
