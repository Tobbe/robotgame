function Tokenizer(code) {
    this.tokens = code
        .split(/([().{}])|[; \n]/)
        .filter(function (item) { return item; });
    this.currentToken = null;
}

Tokenizer.prototype.getNextToken = function () {
    return (this.currentToken = this.tokens.shift());
};

Tokenizer.prototype.getCurrentToken = function () {
    return this.currentToken;
};

