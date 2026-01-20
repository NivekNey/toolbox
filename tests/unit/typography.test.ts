import { describe, it, expect } from 'vitest';
import { googleToMarkdown } from '$lib/utils/typography';

describe('Typography Utility', () => {
    describe('googleToMarkdown', () => {
        it('should handle empty string', () => {
            expect(googleToMarkdown('')).toBe('');
        });

        it('should replace smart quotes', () => {
            expect(googleToMarkdown('“Hello” and ‘World’')).toBe('"Hello" and \'World\'');
        });

        it('should replace ellipses', () => {
            expect(googleToMarkdown('Wait for it…')).toBe('Wait for it...');
        });

        it('should replace em dashes and en dashes', () => {
            expect(googleToMarkdown('Text—more text–less text')).toBe('Text--more text-less text');
        });

        it('should clean up multiple spaces', () => {
            expect(googleToMarkdown('Too  many   spaces')).toBe('Too many spaces');
        });

        it('should convert lists (basic heuristic)', () => {
            const input = '• Item 1\n• Item 2';
            const expected = '- Item 1\n- Item 2';
            expect(googleToMarkdown(input)).toBe(expected);
        });

        it('should handle complex mixed content', () => {
            const input = '“Smart quotes” with an em—dash and a list:\n• First item…\n• Second item';
            const expected = '"Smart quotes" with an em--dash and a list:\n- First item...\n- Second item';
            expect(googleToMarkdown(input)).toBe(expected);
        });
    });
});
