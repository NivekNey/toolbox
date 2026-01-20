import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { simulateTyping, simulateKeyboard, waitForDebounce } from '../utils/setup';
import Base64Tool from '$lib/components/Base64Tool.svelte';

// Mock clipboard API
const mockClipboard = {
	writeText: vi.fn().mockResolvedValue(undefined)
};

Object.assign(navigator, { clipboard: mockClipboard });

describe('Base64Tool Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	describe('Initial Render', () => {
		it('should render with initial state', () => {
			render(Base64Tool);
			expect(document.querySelector('[data-testid="mode-toggle"]')).toBeTruthy();
			expect(document.querySelector('[data-testid="input-textarea"]')).toBeTruthy();
			expect(document.querySelector('[data-testid="output-textarea"]')).toBeTruthy();
		});

		it('should start in encode mode', () => {
			render(Base64Tool);
			const toggle = document.querySelector('[data-testid="mode-toggle"]');
			expect(toggle?.textContent?.toLowerCase()).toContain('encode');
		});
	});

	describe('Encoding Mode', () => {
		it('should encode input in real-time', async () => {
			render(Base64Tool);
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			await simulateTyping(input, 'hello');
			await waitForDebounce(100); // Wait for reactivity and debounce
			const output = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;
			expect(output?.value).toBe('aGVsbG8=');
		});

		it('should handle Unicode characters in encode mode', async () => {
			render(Base64Tool);
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			await simulateTyping(input, '👍');
			await waitForDebounce(100);
			const output = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;
			expect(output?.value).toBe('8J+RjQ==');
		});
	});

	describe('Decoding Mode', () => {
		it('should switch to decode mode', async () => {
			render(Base64Tool);
			const toggle = document.querySelector('[data-testid="mode-toggle"]');
			await fireEvent.click(toggle!);
			expect(toggle?.textContent?.toLowerCase()).toContain('decode');
		});

		it('should decode input in real-time after switching', async () => {
			render(Base64Tool);
			const toggle = document.querySelector('[data-testid="mode-toggle"]');
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			await fireEvent.click(toggle!);
			await simulateTyping(input, 'aGVsbG8=');
			await waitForDebounce(100);
			const output = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;
			expect(output?.value).toBe('hello');
		});
	});

	describe('Mode Switching', () => {
		it('should preserve content when switching modes', async () => {
			render(Base64Tool);
			const toggle = document.querySelector('[data-testid="mode-toggle"]');
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			await simulateTyping(input, 'hello');
			await waitForDebounce(100);
			await fireEvent.click(toggle!);
			await waitForDebounce(100);
			expect(input?.value).toBe('aGVsbG8=');
			const output = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;
			expect(output?.value).toBe('hello');
		});
	});

	describe('Copy Functionality', () => {
		it('should copy output to clipboard', async () => {
			render(Base64Tool);
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			await simulateTyping(input, 'hello');
			await waitForDebounce(100);
			const copyButton = document.querySelector('[data-testid="copy-button"]');
			await fireEvent.click(copyButton!);
			await waitForDebounce(50);
			expect(mockClipboard.writeText).toHaveBeenCalledWith('aGVsbG8=');
		});

		it('should show copy feedback', async () => {
			render(Base64Tool);
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			await simulateTyping(input, 'test');
			await waitForDebounce(100);
			const copyButton = document.querySelector('[data-testid="copy-button"]');
			await fireEvent.click(copyButton!);
			await waitForDebounce(50);
			expect(copyButton?.textContent).toContain('Copied!');
		});
	});

	describe('Real-time Updates', () => {
		it('should update output on every keystroke', async () => {
			render(Base64Tool);
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			const output = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;
			await simulateTyping(input, 'h');
			await waitForDebounce(100);
			expect(output?.value).toBe('aA==');
		});

		it('should handle rapid typing without performance issues', async () => {
			render(Base64Tool);
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			const startTime = performance.now();
			for (let i = 0; i < 20; i++) {
				await simulateTyping(input, 'a');
			}
			await waitForDebounce(50);
			const endTime = performance.now();
			expect(endTime - startTime).toBeLessThan(1500); // 20 * 10ms typing + debounce
		});
	});

	describe('Error Handling', () => {
		it('should handle invalid Base64 input in decode mode', async () => {
			render(Base64Tool);
			const toggle = document.querySelector('[data-testid="mode-toggle"]');
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			await fireEvent.click(toggle!);
			await simulateTyping(input, 'invalid!@#');
			await waitForDebounce(100);
			expect(document.querySelector('[data-testid="error-message"]')).toBeTruthy();
		});

		it('should clear error when valid input is provided', async () => {
			render(Base64Tool);
			const toggle = document.querySelector('[data-testid="mode-toggle"]');
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			await fireEvent.click(toggle!);
			await simulateTyping(input, 'invalid');
			await waitForDebounce(100);
			expect(document.querySelector('[data-testid="error-message"]')).toBeTruthy();
			await simulateTyping(input, 'aGVsbG8=');
			await waitForDebounce(100);
			expect(document.querySelector('[data-testid="error-message"]')).toBeFalsy();
		});
	});

	describe('Keyboard Navigation', () => {
		it('should focus input when rendered', () => {
			render(Base64Tool);
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			expect(document.activeElement === input || input.hasAttribute('autofocus')).toBeTruthy();
		});

		it('should handle Escape to clear', async () => {
			render(Base64Tool);
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			await simulateTyping(input, 'test');
			await waitForDebounce(100);
			await simulateKeyboard(input, [{ key: 'Escape' }]);
			await waitForDebounce(50);
			expect(input?.value).toBe('');
		});
	});

	describe('Visual States', () => {
		it('should show loading state during processing', async () => {
			render(Base64Tool);
			// The onMount forces isLoading = true briefly
			expect(document.querySelector('[data-testid="loading-indicator"]')).toBeTruthy();
		});

		it('should have proper accessibility attributes', () => {
			render(Base64Tool);
			const input = document.querySelector('[data-testid="input-textarea"]');
			const toggle = document.querySelector('[data-testid="mode-toggle"]');
			expect(input?.getAttribute('aria-label')).toBeTruthy();
			expect(toggle?.getAttribute('aria-label')).toBeTruthy();
			expect(toggle?.getAttribute('role')).toBe('button');
		});
	});
});