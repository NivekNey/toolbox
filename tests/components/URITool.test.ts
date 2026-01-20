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
        expect(document.querySelector('[data-testid="input-textarea"]')).toBeTruthy();
        expect(document.querySelector('[data-testid="output-textarea"]')).toBeTruthy();
    });

    it('should encode from Raw to Encoded', async () => {
        render(URITool);
        const rawInput = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
        const encodedInput = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;

        await simulateTyping(rawInput, 'hello world');
        await waitForDebounce(300);

        expect(encodedInput.value).toBe('hello%20world');
    });

    it('should decode from Encoded to Raw', async () => {
        render(URITool);
        const rawInput = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
        const encodedInput = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;

        await simulateTyping(encodedInput, 'hello%20world');
        await waitForDebounce(300);

        expect(rawInput.value).toBe('hello world');
    });

    it('should copy Raw content to clipboard', async () => {
        render(URITool);
        const rawInput = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;

        await simulateTyping(rawInput, 'test raw');
        await waitForDebounce(100);

        const copyButton = document.querySelector('[data-testid="copy-button-raw"]');
        await fireEvent.click(copyButton!);

        expect(mockClipboard.writeText).toHaveBeenCalledWith('test raw');
    });

    it('should copy Encoded content to clipboard', async () => {
        render(URITool);
        const rawInput = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;

        await simulateTyping(rawInput, 'test encoded');
        await waitForDebounce(100);

        const copyButton = document.querySelector('[data-testid="copy-button-encoded"]');
        await fireEvent.click(copyButton!);

        expect(mockClipboard.writeText).toHaveBeenCalledWith('test%20encoded');
    });

    it('should clear all fields', async () => {
        render(URITool);
        const rawInput = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
        const encodedInput = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;
        const clearButton = document.querySelector('[data-testid="clear-button"]');

        await simulateTyping(rawInput, 'test');
        await waitForDebounce(100);

        await fireEvent.click(clearButton!);

        expect(rawInput.value).toBe('');
        expect(encodedInput.value).toBe('');
    });
});
