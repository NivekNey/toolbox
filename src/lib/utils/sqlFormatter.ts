/**
 * Lightweight SQL Formatter
 * Implements a tokenizer and structural formatter to mimic AST-based behavior
 */

enum TokenType {
    KEYWORD,
    IDENTIFIER,
    OPERATOR,
    STRING,
    NUMBER,
    WHITESPACE,
    COMMA,
    PAREN_OPEN,
    PAREN_CLOSE,
    OTHER
}

interface Token {
    type: TokenType;
    value: string;
}

const KEYWORDS = new Set([
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'GROUP', 'BY', 'ORDER', 'LIMIT', 'OFFSET',
    'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'JOIN', 'LEFT', 'RIGHT',
    'INNER', 'OUTER', 'ON', 'AS', 'IN', 'IS', 'NULL', 'NOT', 'EXISTS', 'HAVING'
]);

const NEWLINE_KEYWORDS = new Set([
    'SELECT', 'FROM', 'WHERE', 'GROUP', 'ORDER', 'LIMIT', 'INSERT', 'UPDATE', 'DELETE', 'SET', 'JOIN', 'LEFT', 'RIGHT'
]);

/**
 * Tokenizes SQL string
 */
function tokenize(sql: string): Token[] {
    const tokens: Token[] = [];
    let current = 0;

    while (current < sql.length) {
        let char = sql[current];

        if (/\s/.test(char)) {
            let value = '';
            while (current < sql.length && /\s/.test(sql[current])) {
                value += sql[current++];
            }
            tokens.push({ type: TokenType.WHITESPACE, value: ' ' });
            continue;
        }

        if (char === ',') {
            tokens.push({ type: TokenType.COMMA, value: ',' });
            current++;
            continue;
        }

        if (char === '(') {
            tokens.push({ type: TokenType.PAREN_OPEN, value: '(' });
            current++;
            continue;
        }

        if (char === ')') {
            tokens.push({ type: TokenType.PAREN_CLOSE, value: ')' });
            current++;
            continue;
        }

        if (char === "'" || char === '"') {
            let quote = char;
            let value = char;
            current++;
            while (current < sql.length && sql[current] !== quote) {
                value += sql[current++];
            }
            if (current < sql.length) value += sql[current++];
            tokens.push({ type: TokenType.STRING, value });
            continue;
        }

        if (/[a-zA-Z_]/.test(char)) {
            let value = '';
            while (current < sql.length && /[a-zA-Z0-9_]/.test(sql[current])) {
                value += sql[current++];
            }
            const upper = value.toUpperCase();
            if (KEYWORDS.has(upper)) {
                tokens.push({ type: TokenType.KEYWORD, value: upper });
            } else {
                tokens.push({ type: TokenType.IDENTIFIER, value });
            }
            continue;
        }

        if (/[0-9]/.test(char)) {
            let value = '';
            while (current < sql.length && /[0-9.]/.test(sql[current])) {
                value += sql[current++];
            }
            tokens.push({ type: TokenType.NUMBER, value });
            continue;
        }

        // Operators and others
        tokens.push({ type: TokenType.OTHER, value: char });
        current++;
    }

    return tokens;
}

/**
 * Formats SQL tokens into a pretty string
 */
export function formatSQL(sql: string): string {
    if (!sql) return '';

    const tokens = tokenize(sql);
    let result = '';
    let indentLevel = 0;
    const indent = '  ';

    const getIndent = () => indent.repeat(indentLevel);

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const prev = tokens[i - 1];
        const next = tokens[i + 1];

        if (token.type === TokenType.KEYWORD) {
            if (NEWLINE_KEYWORDS.has(token.value)) {
                if (result.length > 0) result = result.trim() + '\n';
                result += getIndent() + token.value + ' ';
            } else if (token.value === 'AND' || token.value === 'OR') {
                result = result.trim() + '\n' + getIndent() + '  ' + token.value + ' ';
            } else {
                result += token.value + ' ';
            }
        } else if (token.type === TokenType.COMMA) {
            result = result.trim() + ',\n' + getIndent() + '  ';
        } else if (token.type === TokenType.PAREN_OPEN) {
            result += '(';
            indentLevel++;
        } else if (token.type === TokenType.PAREN_CLOSE) {
            indentLevel = Math.max(0, indentLevel - 1);
            result = result.trim() + ') ';
        } else if (token.type === TokenType.WHITESPACE) {
            // Skip explicit whitespace, we handle it
        } else {
            result += token.value + ' ';
        }
    }

    return result.trim()
        .replace(/ \./g, '.')
        .replace(/\. /g, '.')
        .replace(/ ,/g, ',')
        .replace(/\( /g, '(')
        .replace(/ \)/g, ')')
        .replace(/\n\s+\n/g, '\n');
}
