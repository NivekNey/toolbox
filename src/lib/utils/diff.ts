export interface DiffPart {
    value: string;
    added?: boolean;
    removed?: boolean;
}

export interface LineDiff {
    type: 'added' | 'removed' | 'unchanged';
    oldLineNumber?: number;
    newLineNumber?: number;
    content: string | DiffPart[]; // Content can be raw string or parts for highlighting
}

/**
 * Computes a diff between two strings at the line level, 
 * with character-level highlighting for similar lines.
 */
export function computeDiff(oldStr: string, newStr: string): LineDiff[] {
    const oldLines = oldStr === '' ? [] : oldStr.split(/\r?\n/);
    const newLines = newStr === '' ? [] : newStr.split(/\r?\n/);

    // Simple LCS for lines
    const matrix = Array(oldLines.length + 1).fill(0).map(() => Array(newLines.length + 1).fill(0));

    for (let i = 1; i <= oldLines.length; i++) {
        for (let j = 1; j <= newLines.length; j++) {
            if (oldLines[i - 1] === newLines[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1] + 1;
            } else {
                matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
            }
        }
    }

    const result: LineDiff[] = [];
    let i = oldLines.length;
    let j = newLines.length;

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
            result.unshift({
                type: 'unchanged',
                oldLineNumber: i,
                newLineNumber: j,
                content: oldLines[i - 1]
            });
            i--;
            j--;
        } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
            result.unshift({
                type: 'added',
                newLineNumber: j,
                content: newLines[j - 1]
            });
            j--;
        } else if (i > 0) {
            result.unshift({
                type: 'removed',
                oldLineNumber: i,
                content: oldLines[i - 1]
            });
            i--;
        }
    }

    // Post-process to highlight character changes in "modified" areas
    // (a removal followed by an addition of similar lines)
    for (let k = 0; k < result.length - 1; k++) {
        const current = result[k];
        const next = result[k + 1];

        if (current.type === 'removed' && next.type === 'added') {
            const oldText = current.content as string;
            const newText = next.content as string;
            const similarity = getSimilarity(oldText, newText);

            if (similarity > 0.5) {
                current.content = computeCharDiff(oldText, newText, 'removed');
                next.content = computeCharDiff(oldText, newText, 'added');
            }
        }
    }

    return result;
}

function getSimilarity(s1: string, s2: string): number {
    if (s1 === s2) return 1;
    if (s1.length === 0 || s2.length === 0) return 0;

    // Levenshtein-ish similarity
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    const longerLength = longer.length;

    // Simple intersection-based similarity for speed
    let matches = 0;
    const s2Chars = s2.split('');
    for (const char of s1) {
        const idx = s2Chars.indexOf(char);
        if (idx !== -1) {
            matches++;
            s2Chars.splice(idx, 1);
        }
    }

    return matches / longerLength;
}

function computeCharDiff(oldStr: string, newStr: string, mode: 'added' | 'removed'): DiffPart[] {
    const diff = computeSimpleDiff(oldStr, newStr);

    return diff.map(part => {
        if (mode === 'removed') {
            return {
                value: part.value,
                removed: part.removed // Highlight if it was removed (not in new string)
            };
        } else {
            return {
                value: part.value,
                added: part.added // Highlight if it was added (not in old string)
            };
        }
    }).filter(part => {
        if (mode === 'removed') return !part.added;
        return !part.removed;
    });
}

// Fixed character diff implementation
export function computeSimpleDiff(oldStr: string, newStr: string): DiffPart[] {
    // Basic word-level diff for simpler tools
    const parts: DiffPart[] = [];
    const oldWords = oldStr.split(/(\s+)/);
    const newWords = newStr.split(/(\s+)/);

    let i = 0, j = 0;
    while (i < oldWords.length || j < newWords.length) {
        if (i < oldWords.length && j < newWords.length && oldWords[i] === newWords[j]) {
            parts.push({ value: oldWords[i] });
            i++; j++;
        } else if (j < newWords.length && (i >= oldWords.length || !oldWords.slice(i).includes(newWords[j]))) {
            parts.push({ value: newWords[j], added: true });
            j++;
        } else if (i < oldWords.length) {
            parts.push({ value: oldWords[i], removed: true });
            i++;
        }
    }
    return parts;
}
