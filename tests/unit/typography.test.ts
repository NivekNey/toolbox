import { describe, it, expect } from 'vitest';
import { googleToMarkdown, markdownToHtml } from '$lib/utils/typography';

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

        it('should convert numbered lists', () => {
            const input = '1. Item one\n2. Item two';
            const expected = '1. Item one\n2. Item two';
            expect(googleToMarkdown(input)).toBe(expected);
        });

        it('should handle code blocks (backticks)', () => {
            const input = 'Use the `function()` to start.';
            const expected = 'Use the `function()` to start.';
            expect(googleToMarkdown(input)).toBe(expected);
        });

        it('should convert HTML code tags', () => {
            const input = '<p>Run <code>npm install</code> to begin.</p>';
            const expected = 'Run `npm install` to begin.';
            expect(googleToMarkdown(input)).toBe(expected);
        });

        it('should handle multi-line code blocks in HTML', () => {
            const input = '<pre><code>const x = 1;\nconsole.log(x);</code></pre>';
            const expected = '```\nconst x = 1;\nconsole.log(x);\n```';
            expect(googleToMarkdown(input)).toBe(expected);
        });

        it('should handle complex mixed content', () => {
            const input = '“Smart quotes” with an em—dash and a list:\n• First item…\n• Second item';
            const expected = '"Smart quotes" with an em--dash and a list:\n- First item...\n- Second item';
            expect(googleToMarkdown(input)).toBe(expected);
        });

        it('should convert HTML formatting (Google Docs paste)', () => {
            const input = '<p>This is <b>bold</b> and <i>italic</i> with a <a href="https://example.com">link</a>.</p><ul><li>Item 1</li><li>Item 2</li></ul>';
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

    describe('markdownToHtml', () => {
        it('should convert headers', () => {
            expect(markdownToHtml('# Title')).toContain('<h1>Title</h1>');
            expect(markdownToHtml('## Subtitle')).toContain('<h2>Subtitle</h2>');
        });

        it('should convert bold and italic', () => {
            const result = markdownToHtml('**bold** and *italic*');
            expect(result).toContain('<b>bold</b>');
            expect(result).toContain('<i>italic</i>');
        });

        it('should convert links', () => {
            expect(markdownToHtml('[Link](url)')).toContain('<a href="url">Link</a>');
        });

        it('should convert lists', () => {
            const result = markdownToHtml('- Item 1\n- Item 2');
            expect(result).toContain('<ul><li>Item 1</li><li>Item 2</li></ul>');
        });
    });
});
