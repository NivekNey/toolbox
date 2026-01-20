import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import { simulateTyping, waitForDebounce } from '../utils/setup';
import DiffTool from '$lib/components/DiffTool.svelte';

describe('DiffTool Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('should render correctly', () => {
        render(DiffTool);
        expect(document.querySelector('[data-testid="diff-tool"]')).toBeTruthy();
        expect(document.querySelector('[data-testid="input-old"]')).toBeTruthy();
        expect(document.querySelector('[data-testid="input-new"]')).toBeTruthy();
    });

    it('should compute diff in real-time', async () => {
        render(DiffTool);
        const inputOld = document.querySelector('[data-testid="input-old"]') as HTMLTextAreaElement;
        const inputNew = document.querySelector('[data-testid="input-new"]') as HTMLTextAreaElement;

        await simulateTyping(inputOld, 'hello world');
        await simulateTyping(inputNew, 'hello there');
        await waitForDebounce(200);

        const diffContainer = document.querySelector('[data-testid="diff-container"]');
        expect(diffContainer?.textContent).toContain('hello');

        const removed = document.querySelectorAll('[data-testid="diff-removed"]');
        const added = document.querySelectorAll('[data-testid="diff-added"]');

        expect(removed.length).toBeGreaterThan(0);
        expect(added.length).toBeGreaterThan(0);
    });

    it('should handle clearing inputs', async () => {
        render(DiffTool);
        const inputOld = document.querySelector('[data-testid="input-old"]') as HTMLTextAreaElement;
        const inputNew = document.querySelector('[data-testid="input-new"]') as HTMLTextAreaElement;

        await simulateTyping(inputOld, 'test');
        await simulateTyping(inputNew, 'test2');
        await waitForDebounce(200);

        expect(document.querySelector('[data-testid="diff-container"]')?.textContent).toBeTruthy();

        await simulateTyping(inputOld, '');
        await simulateTyping(inputNew, '');
        await waitForDebounce(200);

        expect(document.querySelector('[data-testid="diff-container"]')?.textContent).toContain('No changes detected');
    });
});
