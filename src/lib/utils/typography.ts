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
        // Basic HTML to Markdown conversion
        markdown = markdown
            .replace(/<(b|strong)[^>]*>(.*?)<\/\1>/gi, '**$2**') // Bold
            .replace(/<(i|em)[^>]*>(.*?)<\/\1>/gi, '*$2*')      // Italics
            .replace(/<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)') // Links
            .replace(/<li>(.*?)<\/li>/gi, '- $1\n')             // List items
            .replace(/<(ul|ol)[^>]*>(.*?)<\/\1>/gi, '$2\n')     // Lists
            .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')          // Paragraphs
            .replace(/<br\s*\/?>/gi, '\n');                    // Breaks

        // Strip remaining tags
        markdown = markdown.replace(/<[^>]+>/g, '');

        // Decode HTML entities (basic ones)
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

    // Multiple spaces
    markdown = markdown.replace(/ {2,}/g, ' ');

    return markdown.trim().replace(/\n{3,}/g, '\n\n');
}

/**
 * Converts Markdown to a cleaner Typography format
 */
export function convertMarkdownToTypography(input: string): string {
    // For now, this tool is primarily Google Docs -> Markdown
    return input;
}
