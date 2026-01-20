import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { simulateTyping, waitForDebounce } from '../utils/setup';
import URITool from '$lib/components/URITool.svelte';

// Mock clipboard API
const mockClipboard = {
    writeText: vi.fn().mockResolvedValue(undefined)
};

Object.assign(navigator, { clipboard: mockClipboard });

describe('URITool Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('should render correctly', () => {
        render(URITool);
        expect(document.querySelector('[data-testid="uri-tool"]')).toBeTruthy();
        expect(document.querySelector('[data-testid="mode-toggle"]')).toBeTruthy();
        expect(document.querySelector('[data-testid="input-textarea"]')).toBeTruthy();
    });

    it('should encode URI in real-time', async () => {
        render(URITool);
        const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;

        await simulateTyping(input, 'hello world');
        await waitForDebounce(100);

        const output = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;
        expect(output?.value).toBe('hello%20world');
    });

    it('should switch to decode mode and decode content', async () => {
        render(URITool);
        const toggle = document.querySelector('[data-testid="mode-toggle"]');
        const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;

        await fireEvent.click(toggle!);
        expect(toggle?.textContent).toContain('Encode');

        await simulateTyping(input, 'hello%20world');
        await waitForDebounce(100);

        const output = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;
        expect(output?.value).toBe('hello world');
    });

    it('should copy output to clipboard', async () => {
        render(URITool);
        const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;

        await simulateTyping(input, 'test');
        await waitForDebounce(100);

        const copyButton = document.querySelector('[data-testid="copy-button"]');
        await fireEvent.click(copyButton!);
        await waitForDebounce(50);

        expect(mockClipboard.writeText).toHaveBeenCalledWith('test');
    });
});
