/**
 * Lightweight SQL Formatter
 * Implements a tokenizer and structural formatter to mimic AST-based behavior
 */

export enum TokenType {
    KEYWORD,
    IDENTIFIER,
    OPERATOR,
    STRING,
    NUMBER,
    WHITESPACE,
    COMMA,
    PAREN_OPEN,
    PAREN_CLOSE,
    COMMENT,
    OTHER
}

export interface Token {
    type: TokenType;
    value: string;
}

const KEYWORDS = new Set([
    // Core DML
    'SELECT', 'FROM', 'WHERE', 'GROUP', 'ORDER', 'BY', 'LIMIT', 'OFFSET', 'HAVING', 'AS', 'DISTINCT',
    'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'TRUNCATE', 'MERGE', 'CALL', 'EXPLAIN', 'DESCRIBE',
    // Joins and Sets
    'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'FULL', 'CROSS', 'NATURAL', 'ON', 'USING',
    'UNION', 'ALL', 'INTERSECT', 'EXCEPT', 'MINUS',
    // Logic and Comparisons
    'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'EXISTS', 'BETWEEN', 'LIKE', 'ILIKE', 'SIMILAR', 'REGEXP', 'RLIKE',
    'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'COALESCE', 'IFNULL', 'NULLIF',
    // DDL
    'CREATE', 'ALTER', 'DROP', 'RENAME', 'ADD', 'COLUMN', 'TABLE', 'VIEW', 'INDEX', 'SCHEMA', 'DATABASE',
    'CONSTRAINT', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'CHECK', 'UNIQUE', 'DEFAULT',
    // Window and Analytics
    'OVER', 'PARTITION', 'WINDOW', 'ROWS', 'RANGE', 'PRECEDING', 'FOLLOWING', 'UNBOUNDED', 'CURRENT', 'ROW', 'QUALIFY', 'PIVOT', 'UNPIVOT',
    // CTE and Flow
    'WITH', 'RECURSIVE', 'RETURNING', 'CONFLICT', 'DO', 'NOTHING', 'LATERAL',
    // BigQuery / Hive / Spark / Procedural
    'STRUCT', 'ARRAY', 'UNNEST', 'CAST', 'CONVERT', 'SAFE_CAST', 'DECLARE', 'BEGIN', 'EXCEPTION', 'IF', 'WHILE', 'LOOP', 'BREAK', 'CONTINUE', 'RETURN',
    // Hive / Spark Specific
    'PARTITIONED', 'CLUSTERED', 'SORTED', 'STORED', 'TERMINATED', 'FIELDS', 'COLLECTION', 'ITEMS', 'KEYS', 'FORMAT', 'SERDE', 'MAP', 'COLLECT_SET', 'COLLECT_LIST',
    'CACHE', 'UNCACHE', 'REFRESH', 'REPARTITION', 'DISTRIBUTE', 'TRANSFORM',
    // Snowflake Specific
    'COPY', 'STAGE', 'FILE_FORMAT', 'WAREHOUSE', 'COMPUTE', 'PIPE', 'TASK', 'STREAM', 'DEDUPLICATE', 'PUT', 'GET', 'LIST', 'REMOVE', 'VALIDATE', 'EXTERNAL',
    // Order and Nulls
    'ASC', 'DESC', 'NULLS', 'FIRST', 'LAST',
    // Common Functions
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ARRAY_AGG', 'STRING_AGG', 'JSON_VALUE', 'REGEXP_EXTRACT'
]);

const NEWLINE_KEYWORDS = new Set([
    'SELECT', 'FROM', 'WHERE', 'GROUP', 'ORDER', 'LIMIT', 'OFFSET', 'HAVING',
    'INSERT', 'UPDATE', 'DELETE', 'SET', 'VALUES', 'MERGE',
    'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'CROSS',
    'UNION', 'INTERSECT', 'EXCEPT',
    'WITH', 'CREATE', 'ALTER', 'DROP', 'TRUNCATE',
    'PARTITIONED', 'STORED', 'CLUSTERED', 'SORTED', 'ROW',
    'COPY', 'PIVOT', 'UNPIVOT', 'QUALIFY', 'WINDOW'
]);

/**
 * Tokenizes SQL string correctly handling comments and operators
 */
export function tokenize(sql: string): Token[] {
    const tokens: Token[] = [];
    let current = 0;

    while (current < sql.length) {
        let char = sql[current];

        // Multi-character operators
        const multiOp = sql.slice(current, current + 2);
        if (['>=', '<=', '<>', '!='].includes(multiOp)) {
            tokens.push({ type: TokenType.OPERATOR, value: multiOp });
            current += 2;
            continue;
        }

        // Single line comment --
        if (char === '-' && sql[current + 1] === '-') {
            let value = '';
            while (current < sql.length && sql[current] !== '\n') {
                value += sql[current++];
            }
            tokens.push({ type: TokenType.COMMENT, value });
            continue;
        }

        // Multi-line comment /* */
        if (char === '/' && sql[current + 1] === '*') {
            let value = '';
            while (current < sql.length && !(sql[current] === '*' && sql[current + 1] === '/')) {
                value += sql[current++];
            }
            if (current < sql.length) value += sql[current++]; // *
            if (current < sql.length) value += sql[current++]; // /
            tokens.push({ type: TokenType.COMMENT, value });
            continue;
        }

        if (/\s/.test(char)) {
            let value = '';
            while (current < sql.length && /\s/.test(sql[current])) {
                value += sql[current++];
            }
            tokens.push({ type: TokenType.WHITESPACE, value });
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

        // Strings (with optional r prefix for regex)
        if (char === "'" || char === '"' || char === '`' || (char === 'r' && (sql[current + 1] === "'" || sql[current + 1] === '"'))) {
            let prefix = '';
            if (char === 'r' && (sql[current + 1] === "'" || sql[current + 1] === '"')) {
                prefix = 'r';
                current++;
                char = sql[current];
            }
            let quote = char;
            let value = prefix + char;
            current++;
            while (current < sql.length && sql[current] !== quote) {
                value += sql[current++];
            }
            if (current < sql.length) value += sql[current++];
            tokens.push({ type: TokenType.STRING, value });
            continue;
        }

        // Numbers
        if (/[0-9]/.test(char)) {
            let value = '';
            while (current < sql.length && /[0-9.]/.test(sql[current])) {
                value += sql[current++];
            }
            tokens.push({ type: TokenType.NUMBER, value });
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

        // Operators and others
        tokens.push({ type: TokenType.OTHER, value: char });
        current++;
    }

    return tokens;
}

/**
 * Formats SQL into both plain text and highlighted tokens
 */
export function formatSQL(sql: string): { text: string; tokens: Token[] } {
    if (!sql) return { text: '', tokens: [] };

    const rawTokens = tokenize(sql);
    const formattedTokens: Token[] = [];
    let indentLevel = 0;
    const indent = '  ';

    const addToken = (type: TokenType, value: string) => {
        formattedTokens.push({ type, value });
    };

    const addNewline = () => {
        if (formattedTokens.length > 0) {
            const last = formattedTokens[formattedTokens.length - 1];
            if (last.type === TokenType.WHITESPACE && last.value.includes('\n')) {
                last.value = '\n' + indent.repeat(indentLevel);
                return;
            }
        }
        addToken(TokenType.WHITESPACE, '\n' + indent.repeat(indentLevel));
    };

    const blockKeywords = new Set(['SELECT', 'FROM', 'WHERE', 'ORDER', 'LIMIT', 'GROUP', 'INSERT', 'UPDATE', 'DELETE', 'SET', 'JOIN', 'VALUES', 'HAVING', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'WITH', 'CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'PIVOT', 'UNPIVOT', 'QUALIFY', 'WINDOW', 'COPY', 'MERGE']);

    for (let i = 0; i < rawTokens.length; i++) {
        const token = rawTokens[i];

        if (token.type === TokenType.KEYWORD && blockKeywords.has(token.value)) {
            // Extract full keyword phrase (e.g., GROUP BY, INNER JOIN)
            let fullValue = token.value;
            let lookAhead = i + 1;
            if (rawTokens[lookAhead]?.type === TokenType.WHITESPACE) lookAhead++;
            const nextToken = rawTokens[lookAhead];

            if ((token.value === 'GROUP' || token.value === 'ORDER' || token.value === 'BY') && nextToken?.value === 'BY') {
                fullValue = token.value + ' ' + nextToken.value;
                i = lookAhead;
            } else if (['INNER', 'LEFT', 'RIGHT', 'OUTER'].includes(token.value) && nextToken?.value === 'JOIN') {
                fullValue = token.value + ' ' + nextToken.value;
                i = lookAhead;
            }

            // Clean up trailing commas before block keywords
            if (formattedTokens.length > 0) {
                const lastIdx = formattedTokens.length - 1;
                if (formattedTokens[lastIdx].type === TokenType.WHITESPACE && lastIdx > 0) {
                    if (formattedTokens[lastIdx - 1].type === TokenType.COMMA) {
                        formattedTokens.splice(lastIdx - 1, 1);
                    }
                } else if (formattedTokens[lastIdx].type === TokenType.COMMA) {
                    formattedTokens.splice(lastIdx, 1);
                }
            }

            indentLevel = 0;
            if (formattedTokens.length > 0) addNewline();
            addToken(TokenType.KEYWORD, fullValue);
            addToken(TokenType.WHITESPACE, ' ');

            if (['SELECT', 'WHERE', 'GROUP BY', 'HAVING', 'WITH', 'WINDOW'].includes(fullValue)) {
                indentLevel = 1;
                addNewline();
            }
        } else if (token.type === TokenType.KEYWORD && (token.value === 'AND' || token.value === 'OR')) {
            addNewline();
            addToken(TokenType.KEYWORD, token.value);
            addToken(TokenType.WHITESPACE, ' ');
        } else if (token.type === TokenType.COMMENT) {
            addNewline();
            addToken(TokenType.COMMENT, token.value);
            addNewline();
        } else if (token.type === TokenType.COMMA) {
            addToken(TokenType.COMMA, ',');
            addNewline();
        } else if (token.type === TokenType.PAREN_OPEN) {
            if (formattedTokens.length > 0) {
                const prev = formattedTokens[formattedTokens.length - 1];
                if (prev.type === TokenType.IDENTIFIER || prev.type === TokenType.KEYWORD) {
                    addToken(TokenType.WHITESPACE, ' ');
                }
            }
            addToken(TokenType.PAREN_OPEN, '(');
        } else if (token.type === TokenType.PAREN_CLOSE) {
            addToken(TokenType.PAREN_CLOSE, ')');
            addToken(TokenType.WHITESPACE, ' ');
        } else if (token.type === TokenType.WHITESPACE) {
            // Skip original whitespace to re-format
        } else {
            addToken(token.type, token.value);
            addToken(TokenType.WHITESPACE, ' ');
        }
    }

    let text = '';
    formattedTokens.forEach(t => text += t.value);

    text = text.trim()
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n\s+\n/g, '\n')
        .replace(/ \./g, '.')
        .replace(/\. /g, '.')
        .replace(/ ,/g, ',')
        .replace(/\( /g, '(')
        .replace(/ \)/g, ')')
        .replace(/ @ /g, ' @')           // Fix Snowflake stage spacing
        .replace(/ ;/g, ';')
        .replace(/\b(AS|ASC|DESC)\b/gi, (m) => m.toUpperCase());

    return {
        text,
        tokens: tokenize(text)
    };
}
