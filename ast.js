function TreeNode(data, isRoot) {
    this.data = data;
    this.isRoot = isRoot;
    this.children = [];
}

TreeNode.prototype.newLevelChild = function(data) {
    if (this.children.length === 0) {
        this.children.push(new TreeNode(data));
    } else {
        this.children[0].newLevelChild(data);
    }
};

TreeNode.prototype.toArray = function() {
    var array = this.data ? this.data.toArray() : [];

    if (this.children.length) {
        var childArray = this.children[0].toArray();
        array = this.isRoot ? childArray : array.concat(childArray);
    }

    return array;
};

function MethodInvocation(method, invocations) {
    this.method = method;
    this.invocations = invocations || 1;
}

MethodInvocation.prototype.toArray = function () {
    var array = [];

    for (var i = 0; i < this.invocations; i++) {
        array.push(this.method);
    }

    return array;
};

MethodInvocation.create = function (name, args) {
    if (name.indexOf('move') === 0) {
        var direction = name.substring(4, name.length).toLowerCase();
        var repetitions = args[0];
        methodInvocation = new MethodInvocation(direction, repetitions);
    } else {
        methodInvocation = new MethodInvocation(name);
    }

    return methodInvocation;
};

function ConditionalStatement(methodInvocation, ifMethodBlock) {
    this.methodInvocation = methodInvocation;
    this.ifMethodBlock = ifMethodBlock;
}

ConditionalStatement.prototype.toArray = function () {
    var array = this.methodInvocation.toArray();
    array.push('cond 2');
    array.push('jmpr ' + (this.ifMethodBlock.toArray().length + 1));
    array = array.concat(this.ifMethodBlock.toArray());

    return array;
};

function MethodBlock(methodInvocations) {
    this.methodInvocations = methodInvocations;
}

MethodBlock.prototype.toArray = function () {
    var array = [];
    this.methodInvocations.forEach(function (inv) {
        array = array.concat(inv.toArray());
    });

    return array;
};

function LoopStatement(methodBlock) {
    this.methodBlock = methodBlock;
    LoopStatement.prototype.num = (this.num || 0) + 1;
}

LoopStatement.prototype.getId = function () {
    return 'loop_statement_' + this.num;
};

LoopStatement.prototype.toArray = function () {
    var array = ['lbl ' + this.getId()];
    array = array.concat(this.methodBlock.toArray());
    array.push('jmp ' + this.getId());

    return array;
};

function NumberAtom(number) {
    this.number = number;
}

NumberAtom.prototype.toArray = function () {
    return ['ret ' + this.number];
};

function ParseExpression(operator, lhs, rhs) {
    this.operator = operator;
    this.lhs = lhs;
    this.rhs = rhs;
}

ParseExpression.prototype.toArray = function () {
    var operatorString;

    switch (this.operator) {
        case '+': operatorString = 'add'; break;
        case '-': operatorString = 'sub'; break;
        case '*': operatorString = 'mul'; break;
        case '/': operatorString = 'div'; break;
    }

    return this.lhs.toArray().concat(this.rhs.toArray()).concat([operatorString]);
};

