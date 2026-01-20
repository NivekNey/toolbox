/**
 * Typography conversion utilities
 * Primarily handles Google Docs formatting to Markdown
 */

/**
 * Converts Google Docs formatted text/HTML to Markdown
 * This is a simplified implementation focusing on core formatting
 */
export function googleToMarkdown(input: string): string {
    if (typeof input !== 'string') {
        throw new TypeError('Input must be a string');
    }

    if (input === '') return '';

    let markdown = input;

    // Detect if input is HTML (common when pasting with formatting)
    const isHTML = /<[a-z][\s\S]*>/i.test(input);

    if (isHTML) {
        // First, strip unwanted top-level formatting that might wrap blocks
        // e.g., <b style="font-weight:normal"><h1>...</h1></b>
        markdown = markdown.replace(/<(b|strong|i|em)[^>]*>\s*(<h[1-6].*?)<\/\1>/gi, '$2');

        // Pre-process spans and style-heavy tags
        markdown = markdown
            .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1')
            .replace(/<div[^>]*>(.*?)<\/div>/gi, '$1\n');

        // Headers - handle h1-h6
        markdown = markdown.replace(/<h([1-6])[^>]*>(.*?)<\/h\1>/gi, (match, level, content) => {
            return `\n${'#'.repeat(parseInt(level))} ${content.trim()}\n\n`;
        });

        // Lists - Handle aria-level for indentation
        markdown = markdown.replace(/<li[^>]*aria-level="(\d+)"[^>]*>(.*?)<\/li>/gi, (match, level, content) => {
            const indent = '  '.repeat(parseInt(level) - 1);
            // Clean up internal p tags often found in Google Docs lists
            const cleanContent = content.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1').trim();
            return `${indent}- ${cleanContent}\n`;
        });

        // Fallback for simple li
        markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');

        // Links
        markdown = markdown.replace(/<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');

        // Bold and Italics (after block elements are handled)
        markdown = markdown
            .replace(/<(b|strong)[^>]*>(.*?)<\/\1>/gi, '**$2**')
            .replace(/<(i|em)[^>]*>(.*?)<\/\1>/gi, '*$2*');

        // Paragraphs and general blocks
        markdown = markdown
            .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
            .replace(/<(ul|ol)[^>]*>(.*?)<\/\1>/gi, '$2\n');

        // Breaks
        markdown = markdown.replace(/<br\s*\/?>/gi, '\n');

        // Final tag strip
        markdown = markdown.replace(/<[^>]+>/g, '');

        // Decode HTML entities
        markdown = markdown
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
    }

    // Smart quotes
    markdown = markdown.replace(/[\u201C\u201D]/g, '"');
    markdown = markdown.replace(/[\u2018\u2019]/g, "'");

    // Ellipses
    markdown = markdown.replace(/\u2026/g, '...');

    // Em and En dashes
    markdown = markdown.replace(/\u2014/g, '--');
    markdown = markdown.replace(/\u2013/g, '-');

    // Lists (plain text bullets)
    markdown = markdown.replace(/^\u2022\s*/gm, '- ');

    // Multiple spaces (only if not at start of line to preserve indentation)
    markdown = markdown.replace(/([^\n]) {2,}/g, '$1 ');

    return markdown.trim().replace(/\n{3,}/g, '\n\n');
}

/**
 * Converts Markdown to a simple HTML format suitable for Google Docs paste
 */
export function markdownToHtml(input: string): string {
    if (typeof input !== 'string') {
        throw new TypeError('Input must be a string');
    }

    if (input === '') return '';

    let html = input;

    // Escaping basic HTML entities
    html = html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Headers
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');
    html = html.replace(/^##### (.*?)$/gm, '<h5>$1</h5>');
    html = html.replace(/^###### (.*?)$/gm, '<h6>$1</h6>');

    // Bold & Italics
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<b><i>$1</i></b>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');
    html = html.replace(/__(.*?)__/g, '<b>$1</b>');
    html = html.replace(/_(.*?)_/g, '<i>$1</i>');

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

    // Lists (simplified)
    // First handle internal list items
    html = html.replace(/^[ ]*- (.*?)$/gm, '<li>$1</li>');
    // Wrap groups of <li> in <ul> (remove newlines between li to make it more compact)
    html = html.replace(/((?:<li>.*?<\/li>\s*)+)/gs, (match) => {
        return `<ul>${match.trim().replace(/\n/g, '')}</ul>`;
    });

    // Paragraphs - any line that isn't a tag and isn't empty
    html = html.split('\n').map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('<h') || trimmed.startsWith('<ul>') || trimmed.startsWith('</ul>') || trimmed.startsWith('<li>')) {
            return line;
        }
        return `<p>${line}</p>`;
    }).join('\n');

    // Clean up extra wrapping
    html = html.replace(/\n{2,}/g, '\n');

    return `<html><body>${html}</body></html>`;
}
