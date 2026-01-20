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

        it('should convert HTML formatting (Google Docs paste)', () => {
            const input = '<p>This is <b>bold</b> and <i>italic</i> with a <a href="https://example.com">link</a>.</p><ul><li>Item 1</li><li>Item 2</li></ul>';
            // The parser adds newlines for lists and paragraphs
            const expected = 'This is **bold** and *italic* with a [link](https://example.com).\n\n- Item 1\n- Item 2';
            expect(googleToMarkdown(input)).toBe(expected);
        });

        it('should handle headers and nested spans', () => {
            const input = '<h1><span style="font-weight: 400;">H1 Title</span></h1><p><span>Body text</span></p>';
            const expected = '# H1 Title\n\nBody text';
            expect(googleToMarkdown(input)).toBe(expected);
        });

        it('should handle complex nested Google Docs HTML', () => {
            const input = '<b id="docs-internal-guid-..." style="font-weight: normal;"><h1 dir="ltr"><span>H1</span></h1><h2 dir="ltr"><span>H2</span></h2><p dir="ltr"><span>test</span></p><ul style="..."><li dir="ltr" aria-level="1"><p dir="ltr"><span>bullet</span></p></li><ul style="..."><li dir="ltr" aria-level="2"><p dir="ltr"><span>nested</span></p></li></ul></ul><br></b>';
            const converted = googleToMarkdown(input);
            expect(converted).toContain('# H1');
            expect(converted).toContain('## H2');
            expect(converted).toContain('test');
            expect(converted).toContain('- bullet');
            expect(converted).toContain('  - nested');
        });
    });
});
