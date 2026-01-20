import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { simulateTyping, waitForDebounce } from '../utils/setup';
import TypographyTool from '$lib/components/TypographyTool.svelte';

// Mock clipboard API
const mockClipboard = {
    writeText: vi.fn().mockResolvedValue(undefined)
};

Object.assign(navigator, { clipboard: mockClipboard });

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
    });

    it('should convert typography in real-time', async () => {
        render(TypographyTool);
        const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;

        await simulateTyping(input, 'Wait for it\u2026');
        await waitForDebounce(200);

        const output = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;
        expect(output?.value).toBe('Wait for it...');
    });

    it('should copy output to clipboard', async () => {
        render(TypographyTool);
        const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;

        await simulateTyping(input, 'test');
        await waitForDebounce(100);

        const copyButton = document.querySelector('[data-testid="copy-button"]');
        await fireEvent.click(copyButton!);
        await waitForDebounce(50);

        expect(mockClipboard.writeText).toHaveBeenCalledWith('test');
    });
});
