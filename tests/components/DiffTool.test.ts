import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import { simulateTyping, waitForDebounce } from '../utils/setup';
import DiffTool from '$lib/components/DiffTool.svelte';

describe('DiffTool Component', () => {
    beforeEach(() => {
        cleanup();
    });

    afterEach(() => {
        cleanup();
    });

    it('should render correctly', () => {
        render(DiffTool);
        expect(document.querySelector('[data-testid="diff-text1"]')).toBeTruthy();
        expect(document.querySelector('[data-testid="diff-text2"]')).toBeTruthy();
    });

    it('should compute diff in real-time', async () => {
        render(DiffTool);
        const input1 = document.querySelector('[data-testid="diff-text1-textarea"]') as HTMLTextAreaElement;
        const input2 = document.querySelector('[data-testid="diff-text2-textarea"]') as HTMLTextAreaElement;

        await simulateTyping(input1, 'hello world');
        await simulateTyping(input2, 'hello vitest');
        await waitForDebounce(200);

        const result = document.querySelector('[data-testid="diff-result"]');
        expect(result).toBeTruthy();
        // Now it shows lines
        expect(document.querySelector('[data-testid="diff-removed"]')?.textContent?.trim()).toBe('hello world');
        expect(document.querySelector('[data-testid="diff-added"]')?.textContent?.trim()).toBe('hello vitest');
    });

    it('should show "No changes detected" for identical text', async () => {
        render(DiffTool);
        const input1 = document.querySelector('[data-testid="diff-text1-textarea"]') as HTMLTextAreaElement;
        const input2 = document.querySelector('[data-testid="diff-text2-textarea"]') as HTMLTextAreaElement;

        await simulateTyping(input1, 'hello');
        await simulateTyping(input2, 'hello');
        await waitForDebounce(100);

        const result = document.querySelector('[data-testid="diff-result"]');
        expect(result?.textContent).toContain('hello');
        expect(document.querySelector('[data-testid="diff-removed"]')).toBeNull();
        expect(document.querySelector('[data-testid="diff-added"]')).toBeNull();
    });
});
