import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
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
        expect(document.querySelector('[data-testid="raw-editor"]')).toBeTruthy();
        expect(document.querySelector('[data-testid="encoded-editor"]')).toBeTruthy();
    });

    it('should encode from Raw to Encoded', async () => {
        render(URITool);
        const rawInput = document.querySelector('[data-testid="raw-editor-textarea"]') as HTMLTextAreaElement;
        const encodedInput = document.querySelector('[data-testid="encoded-editor-textarea"]') as HTMLTextAreaElement;

        await simulateTyping(rawInput, 'hello world');
        await waitForDebounce(200);

        expect(encodedInput.value).toBe('hello%20world');
    });

    it('should decode from Encoded to Raw', async () => {
        render(URITool);
        const rawInput = document.querySelector('[data-testid="raw-editor-textarea"]') as HTMLTextAreaElement;
        const encodedInput = document.querySelector('[data-testid="encoded-editor-textarea"]') as HTMLTextAreaElement;

        await simulateTyping(encodedInput, 'hello%20world');
        await waitForDebounce(200);

        expect(rawInput.value).toBe('hello world');
    });
});
