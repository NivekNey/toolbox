/**
 * Simple character-level diff utility
 */

export interface DiffPart {
    value: string;
    added?: boolean;
    removed?: boolean;
}

/**
 * Computes a simple diff between two strings
 * Using a basic LCS-based approach for character level
 */
export function computeDiff(oldStr: string, newStr: string): DiffPart[] {
    // This is a naive implementation. For a real app, a library like 'diff' would be better.
    // But since "No dependencies" is a goal (README: "No dependencies: All processing client-side"),
    // we'll implement a basic version or use a very simple algorithm.

    // For now, let's do a word-level diff which is often more useful and easier to implement correctly without a lib.
    const oldWords = oldStr.split(/(\s+)/).filter(w => w !== '');
    const newWords = newStr.split(/(\s+)/).filter(w => w !== '');

    const result: DiffPart[] = [];

    // Simple greedy matching for now (Mvp)
    let i = 0;
    let j = 0;

    while (i < oldWords.length || j < newWords.length) {
        if (i < oldWords.length && j < newWords.length && oldWords[i] === newWords[j]) {
            result.push({ value: oldWords[i] });
            i++;
            j++;
        } else if (j < newWords.length && (i >= oldWords.length || !oldWords.slice(i).includes(newWords[j]))) {
            result.push({ value: newWords[j], added: true });
            j++;
        } else if (i < oldWords.length) {
            result.push({ value: oldWords[i], removed: true });
            i++;
        }
    }

    return result;
}
