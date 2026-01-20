import { describe, it, expect } from 'vitest';
import { computeDiff } from '$lib/utils/diff';

describe('Diff Utility', () => {
    describe('computeDiff', () => {
        it('should handle completely different strings', () => {
            const oldText = 'abc';
            const newText = 'def';
            const diff = computeDiff(oldText, newText);

            expect(diff.filter(p => p.removed)).toHaveLength(1); // Naive impl splits by words/spaces
            expect(diff.filter(p => p.added)).toHaveLength(1);
        });

        it('should handle identical strings', () => {
            const text = 'hello';
            const diff = computeDiff(text, text);

            expect(diff).toHaveLength(1);
            expect(diff[0]).toEqual({ value: 'hello' });
        });

        it('should detect additions', () => {
            const oldText = 'hello';
            const newText = 'hello world';
            const diff = computeDiff(oldText, newText);

            expect(diff).toHaveLength(3);
            expect(diff[0]).toEqual({ value: 'hello' });
            expect(diff[1]).toEqual({ value: ' ', added: true });
            expect(diff[2]).toEqual({ value: 'world', added: true });
        });

        it('should detect removals', () => {
            const oldText = 'hello world';
            const newText = 'hello';
            const diff = computeDiff(oldText, newText);

            expect(diff).toHaveLength(3);
            expect(diff[0]).toEqual({ value: 'hello' });
            expect(diff[1]).toEqual({ value: ' ', removed: true });
            expect(diff[2]).toEqual({ value: 'world', removed: true });
        });

        it('should handle middle replacements', () => {
            const oldText = 'hello world !';
            const newText = 'hello there !';
            const diff = computeDiff(oldText, newText);

            expect(diff.some(p => p.removed && p.value === 'world')).toBe(true);
            expect(diff.some(p => p.added && p.value === 'there')).toBe(true);
        });

        it('should handle empty strings', () => {
            expect(computeDiff('', 'a')).toEqual([{ value: 'a', added: true }]);
            expect(computeDiff('a', '')).toEqual([{ value: 'a', removed: true }]);
            expect(computeDiff('', '')).toEqual([]);
        });
    });
});
