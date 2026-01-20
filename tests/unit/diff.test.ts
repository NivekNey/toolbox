import { describe, it, expect } from 'vitest';
import { computeDiff } from '$lib/utils/diff';

describe('Diff Utility', () => {
    describe('computeDiff', () => {
        it('should handle completely different strings', () => {
            const oldText = 'abc';
            const newText = 'def';
            const diff = computeDiff(oldText, newText);

            expect(diff.filter(p => p.type === 'removed')).toHaveLength(1);
            expect(diff.filter(p => p.type === 'added')).toHaveLength(1);
        });

        it('should handle identical strings', () => {
            const text = 'hello';
            const diff = computeDiff(text, text);

            expect(diff).toHaveLength(1);
            expect(diff[0].type).toBe('unchanged');
            expect(diff[0].content).toBe('hello');
        });

        it('should detect additions', () => {
            const oldText = 'hello';
            const newText = 'hello\nworld';
            const diff = computeDiff(oldText, newText);

            expect(diff).toHaveLength(2);
            expect(diff[0].type).toBe('unchanged');
            expect(diff[1].type).toBe('added');
            expect(diff[1].content).toBe('world');
        });

        it('should detect removals', () => {
            const oldText = 'hello\nworld';
            const newText = 'hello';
            const diff = computeDiff(oldText, newText);

            expect(diff).toHaveLength(2);
            expect(diff[0].type).toBe('unchanged');
            expect(diff[1].type).toBe('removed');
            expect(diff[1].content).toBe('world');
        });

        it('should handle middle replacements', () => {
            const oldText = 'hello\nworld\n!';
            const newText = 'hello\nthere\n!';
            const diff = computeDiff(oldText, newText);

            expect(diff.some(p => p.type === 'removed' && (p.content as string).includes('world'))).toBe(true);
            expect(diff.some(p => p.type === 'added' && (p.content as string).includes('there'))).toBe(true);
        });

        it('should handle character-level changes within words', () => {
            const oldText = 'developer';
            const newText = 'developed';
            const diff = computeDiff(oldText, newText);

            // In line mode, this should be one removed line and one added line
            expect(diff.filter(p => p.type === 'removed')).toHaveLength(1);
            expect(diff.filter(p => p.type === 'added')).toHaveLength(1);
        });

        it('should handle empty strings', () => {
            expect(computeDiff('', 'a')).toEqual([{ type: 'added', newLineNumber: 1, content: 'a' }]);
            expect(computeDiff('a', '')).toEqual([{ type: 'removed', oldLineNumber: 1, content: 'a' }]);
            expect(computeDiff('', '')).toEqual([]);
        });

        it('should perform efficiently on large inputs', () => {
            const oldText = 'line content '.repeat(10) + '\n'.repeat(100);
            const newText = 'line content '.repeat(10) + 'changed\n' + '\n'.repeat(100);

            const start = performance.now();
            const diff = computeDiff(oldText, newText);
            const end = performance.now();

            expect(end - start).toBeLessThan(500); // LCS can be O(N^2) so we keep test size reasonable
            expect(diff.length).toBeGreaterThan(0);
        });
    });
});
