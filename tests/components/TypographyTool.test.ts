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
        expect(document.querySelector('[data-testid="typography-tool"]')).toBeTruthy();
        expect(document.querySelector('[data-testid="input-textarea"]')).toBeTruthy();
        expect(document.querySelector('[data-testid="output-textarea"]')).toBeTruthy();
    });

    it('should convert from Plain to Markdown', async () => {
        render(TypographyTool);
        const plainInput = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
        const markdownInput = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;

        await simulateTyping(plainInput, 'Wait for it\u2026');
        await waitForDebounce(200);

        expect(markdownInput.value).toBe('Wait for it...');
    });

    it('should convert from Markdown to Plain', async () => {
        render(TypographyTool);
        const plainInput = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
        const markdownInput = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;

        await simulateTyping(markdownInput, '# Title');
        await waitForDebounce(200);

        expect(plainInput.value).toBe('# Title');
    });

    it('should copy markdown to clipboard', async () => {
        render(TypographyTool);
        const plainInput = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;

        await simulateTyping(plainInput, 'test');
        await waitForDebounce(200);

        const copyButton = document.querySelector('[data-testid="copy-markdown-button"]');
        await fireEvent.click(copyButton!);

        expect(mockClipboard.writeText).toHaveBeenCalledWith('test');
    });

    it('should copy rich text to clipboard', async () => {
        render(TypographyTool);
        const markdownInput = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;

        await simulateTyping(markdownInput, '# Header');
        await waitForDebounce(200);

        const copyButton = document.querySelector('[data-testid="copy-rich-button"]');
        await fireEvent.click(copyButton!);

        expect(mockClipboard.write).toHaveBeenCalled();
    });
});
