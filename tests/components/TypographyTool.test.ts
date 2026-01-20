import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { simulateTyping, waitForDebounce } from '../utils/setup';
import TypographyTool from '$lib/components/TypographyTool.svelte';

// Mock clipboard API
const mockClipboard = {
    writeText: vi.fn().mockResolvedValue(undefined),
    write: vi.fn().mockResolvedValue(undefined)
};

Object.assign(navigator, { clipboard: mockClipboard });

// Mock ClipboardItem
(globalThis as any).ClipboardItem = class ClipboardItem {
    constructor(public data: Record<string, Blob>) { }
};

describe('TypographyTool Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('should render correctly', () => {
        render(TypographyTool);
        expect(document.querySelector('[data-testid="plain-editor"]')).toBeTruthy();
        expect(document.querySelector('[data-testid="markdown-editor"]')).toBeTruthy();
    });

    it('should convert from Plain to Markdown', async () => {
        render(TypographyTool);
        const richInput = document.querySelector('[data-testid="plain-editor-editable"]') as HTMLDivElement;
        const markdownInput = document.querySelector('[data-testid="markdown-editor-textarea"]') as HTMLTextAreaElement;

        await simulateTyping(richInput, 'Wait for it\u2026');
        await waitForDebounce(200);

        expect(markdownInput.value).toBe('Wait for it...');
    });

    it('should convert from Markdown to Plain', async () => {
        render(TypographyTool);
        const richInput = document.querySelector('[data-testid="plain-editor-editable"]') as HTMLDivElement;
        const markdownInput = document.querySelector('[data-testid="markdown-editor-textarea"]') as HTMLTextAreaElement;

        await simulateTyping(markdownInput, '# Title');
        await waitForDebounce(200);

        expect(richInput.innerHTML).toContain('Title');
    });

    it('should copy markdown to clipboard', async () => {
        render(TypographyTool);
        const richInput = document.querySelector('[data-testid="plain-editor-editable"]') as HTMLDivElement;

        await simulateTyping(richInput, 'test');
        await waitForDebounce(200);

        const copyButton = document.querySelector('[data-testid="markdown-editor"] .btn');
        await fireEvent.click(copyButton!);

        expect(mockClipboard.writeText).toHaveBeenCalledWith('test');
    });

    it('should handle rich text paste', async () => {
        render(TypographyTool);
        const richInput = document.querySelector('[data-testid="plain-editor-editable"]') as HTMLDivElement;
        const markdownInput = document.querySelector('[data-testid="markdown-editor-textarea"]') as HTMLTextAreaElement;

        const pasteEvent = new Event('paste', { bubbles: true, cancelable: true });
        (pasteEvent as any).clipboardData = {
            getData: (type: string) => {
                if (type === 'text/html') return '<b>Bold Text</b>';
                if (type === 'text/plain') return 'Bold Text';
                return '';
            }
        };

        await fireEvent(richInput!, pasteEvent);
        await waitForDebounce(200);

        expect(markdownInput.value).toBe('**Bold Text**');
    });
});
