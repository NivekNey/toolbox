import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { simulateTyping, simulateKeyboard, waitForDebounce } from '../utils/setup';
import Base64Tool from '../../../src/lib/components/Base64Tool.svelte';

// Mock clipboard API
const mockClipboard = {
	writeText: vi.fn().mockResolvedValue(undefined)
};

Object.assign(navigator, { clipboard: mockClipboard });

describe('Base64Tool Component', () => {
	let component: any;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		if (component) {
			component.$destroy();
		}
	});

	describe('Initial Render', () => {
		it('should render with initial state', () => {
			component = render(Base64Tool);
			
			expect(document.querySelector('[data-testid="mode-toggle"]')).toBeTruthy();
			expect(document.querySelector('[data-testid="input-textarea"]')).toBeTruthy();
			expect(document.querySelector('[data-testid="output-textarea"]')).toBeTruthy();
			expect(document.querySelector('[data-testid="copy-button"]')).toBeTruthy();
		});

		it('should start in encode mode', () => {
			component = render(Base64Tool);
			
			const toggle = document.querySelector('[data-testid="mode-toggle"]');
			expect(toggle?.textContent).toContain('Encode');
		});

		it('should have empty textareas initially', () => {
			component = render(Base64Tool);
			
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			const output = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;
			
			expect(input?.value).toBe('');
			expect(output?.value).toBe('');
		});
	});

	describe('Encoding Mode', () => {
		it('should encode input in real-time', async () => {
			component = render(Base64Tool);
			
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			const output = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;
			
			await simulateTyping(input, 'hello');
			expect(output?.value).toBe('aGVsbG8=');
		});

		it('should handle Unicode characters in encode mode', async () => {
			component = render(Base64Tool);
			
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			const output = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;
			
			await simulateTyping(input, '👍');
			expect(output?.value).toBe('8J+RjQ==');
		});

		it('should show correct labels in encode mode', () => {
			component = render(Base64Tool);
			
			const inputLabel = document.querySelector('[data-testid="input-label"]');
			const outputLabel = document.querySelector('[data-testid="output-label"]');
			
			expect(inputLabel?.textContent).toContain('Plain Text');
			expect(outputLabel?.textContent).toContain('Base64');
		});
	});

	describe('Decoding Mode', () => {
		it('should switch to decode mode', async () => {
			component = render(Base64Tool);
			
			const toggle = document.querySelector('[data-testid="mode-toggle"]');
			
			await fireEvent.click(toggle!);
			
			expect(toggle?.textContent).toContain('Decode');
		});

		it('should decode input in real-time after switching', async () => {
			component = render(Base64Tool);
			
			const toggle = document.querySelector('[data-testid="mode-toggle"]');
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			const output = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;
			
			// Switch to decode mode
			await fireEvent.click(toggle!);
			
			// Clear both areas first
			await simulateTyping(input, '');
			
			// Type Base64 input
			await simulateTyping(input, 'aGVsbG8=');
			expect(output?.value).toBe('hello');
		});

		it('should update labels in decode mode', async () => {
			component = render(Base64Tool);
			
			const toggle = document.querySelector('[data-testid="mode-toggle"]');
			
			await fireEvent.click(toggle!);
			
			const inputLabel = document.querySelector('[data-testid="input-label"]');
			const outputLabel = document.querySelector('[data-testid="output-label"]');
			
			expect(inputLabel?.textContent).toContain('Base64');
			expect(outputLabel?.textContent).toContain('Plain Text');
		});
	});

	describe('Mode Switching', () => {
		it('should preserve content when switching modes', async () => {
			component = render(Base64Tool);
			
			const toggle = document.querySelector('[data-testid="mode-toggle"]');
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			const output = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;
			
			// Type some content in encode mode
			await simulateTyping(input, 'hello');
			expect(output?.value).toBe('aGVsbG8=');
			
			// Switch to decode mode
			await fireEvent.click(toggle!);
			
			// Should swap content
			expect(input?.value).toBe('aGVsbG8=');
			expect(output?.value).toBe('hello');
			
			// Switch back to encode mode
			await fireEvent.click(toggle!);
			
			// Should swap back
			expect(input?.value).toBe('hello');
			expect(output?.value).toBe('aGVsbG8=');
		});

		it('should update labels when switching modes', async () => {
			component = render(Base64Tool);
			
			const toggle = document.querySelector('[data-testid="mode-toggle"]');
			const inputLabel = document.querySelector('[data-testid="input-label"]');
			const outputLabel = document.querySelector('[data-testid="output-label"]');
			
			// Initial state - encode mode
			expect(inputLabel?.textContent).toContain('Plain Text');
			expect(outputLabel?.textContent).toContain('Base64');
			
			// Switch to decode mode
			await fireEvent.click(toggle!);
			expect(inputLabel?.textContent).toContain('Base64');
			expect(outputLabel?.textContent).toContain('Plain Text');
			
			// Switch back to encode mode
			await fireEvent.click(toggle!);
			expect(inputLabel?.textContent).toContain('Plain Text');
			expect(outputLabel?.textContent).toContain('Base64');
		});
	});

	describe('Copy Functionality', () => {
		it('should copy output to clipboard', async () => {
			component = render(Base64Tool);
			
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			const copyButton = document.querySelector('[data-testid="copy-button"]');
			
			// Type some content
			await simulateTyping(input, 'hello');
			
			// Click copy button
			await fireEvent.click(copyButton!);
			
			// Check if clipboard.writeText was called with correct value
			expect(mockClipboard.writeText).toHaveBeenCalledWith('aGVsbG8=');
			expect(mockClipboard.writeText).toHaveBeenCalledTimes(1);
		});

		it('should show copy feedback', async () => {
			component = render(Base64Tool);
			
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			const copyButton = document.querySelector('[data-testid="copy-button"]');
			
			await simulateTyping(input, 'test');
			await fireEvent.click(copyButton!);
			
			// Check for feedback (could be text change, class change, etc.)
			expect(copyButton?.textContent).toContain('Copied!');
			
			// Wait for feedback to clear
			await waitForDebounce(1500);
			expect(copyButton?.textContent).not.toContain('Copied!');
		});

		it('should not copy when output is empty', async () => {
			component = render(Base64Tool);
			
			const copyButton = document.querySelector('[data-testid="copy-button"]');
			
			// Don't type anything, output should be empty
			await fireEvent.click(copyButton!);
			
			expect(mockClipboard.writeText).not.toHaveBeenCalled();
		});
	});

	describe('Real-time Updates', () => {
		it('should update output on every keystroke', async () => {
			component = render(Base64Tool);
			
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			const output = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;
			
			await simulateTyping(input, 'h');
			expect(output?.value).toBe('aA==');
			
			await simulateTyping(input, 'he');
			expect(output?.value).toBe('aGU=');
			
			await simulateTyping(input, 'hel');
			expect(output?.value).toBe('aGVs');
			
			await simulateTyping(input, 'hell');
			expect(output?.value).toBe('aGVsbA==');
		});

		it('should handle rapid typing without performance issues', async () => {
			component = render(Base64Tool);
			
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			const output = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;
			
			const startTime = performance.now();
			
			// Simulate rapid typing
			for (let i = 0; i < 100; i++) {
				await simulateTyping(input, 'a');
			}
			
			const endTime = performance.now();
			
			// Should complete within reasonable time
			expect(endTime - startTime).toBeLessThan(1000);
			expect(output?.value).toBeTruthy();
		});
	});

	describe('Error Handling', () => {
		it('should handle invalid Base64 input in decode mode', async () => {
			component = render(Base64Tool);
			
			const toggle = document.querySelector('[data-testid="mode-toggle"]');
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			const output = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;
			const errorElement = document.querySelector('[data-testid="error-message"]');
			
			// Switch to decode mode
			await fireEvent.click(toggle!);
			
			// Type invalid Base64
			await simulateTyping(input, 'invalid!@#');
			
			// Should show error
			expect(errorElement).toBeTruthy();
			expect(output?.value).toBe('');
		});

		it('should clear error when valid input is provided', async () => {
			component = render(Base64Tool);
			
			const toggle = document.querySelector('[data-testid="mode-toggle"]');
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			const errorElement = document.querySelector('[data-testid="error-message"]');
			
			// Switch to decode mode
			await fireEvent.click(toggle!);
			
			// Type invalid Base64
			await simulateTyping(input, 'invalid');
			expect(errorElement).toBeTruthy();
			
			// Type valid Base64
			await simulateTyping(input, 'aGVsbG8=');
			expect(errorElement).toBeFalsy();
		});
	});

	describe('Keyboard Navigation', () => {
		it('should focus input when rendered', () => {
			component = render(Base64Tool);
			
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			expect(document.activeElement).toBe(input);
		});

		it('should handle Ctrl+A to select all', async () => {
			component = render(Base64Tool);
			
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			
			await simulateTyping(input, 'test');
			
			// Simulate Ctrl+A
			await simulateKeyboard(input, [{ key: 'a', ctrlKey: true }]);
			
			expect(input?.selectionStart).toBe(0);
			expect(input?.selectionEnd).toBe(4);
		});

		it('should handle Escape to clear', async () => {
			component = render(Base64Tool);
			
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			const output = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;
			
			await simulateTyping(input, 'test');
			
			// Simulate Escape
			await simulateKeyboard(input, [{ key: 'Escape' }]);
			
			expect(input?.value).toBe('');
			expect(output?.value).toBe('');
		});
	});

	describe('Visual States', () => {
		it('should show loading state during processing', async () => {
			component = render(Base64Tool);
			
			// This would require mocking the processing to be slower
			// For now, just test the structure exists
			const loadingElement = document.querySelector('[data-testid="loading-indicator"]');
			expect(loadingElement).toBeTruthy();
		});

		it('should have proper accessibility attributes', () => {
			component = render(Base64Tool);
			
			const input = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
			const output = document.querySelector('[data-testid="output-textarea"]') as HTMLTextAreaElement;
			const copyButton = document.querySelector('[data-testid="copy-button"]');
			const toggle = document.querySelector('[data-testid="mode-toggle"]');
			
			// Check for proper ARIA labels
			expect(input?.getAttribute('aria-label')).toBeTruthy();
			expect(output?.getAttribute('aria-label')).toBeTruthy();
			expect(copyButton?.getAttribute('aria-label')).toBeTruthy();
			expect(toggle?.getAttribute('aria-label')).toBeTruthy();
			
			// Check for proper roles
			expect(copyButton?.getAttribute('role')).toBe('button');
			expect(toggle?.getAttribute('role')).toBe('button');
		});
	});
});