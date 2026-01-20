import { render } from '@testing-library/svelte';
import type { SvelteComponent } from 'svelte';

// Helper to create mock props
export const createMockProps = (overrides: Record<string, any> = {}) => ({
	id: 'test-id',
	name: 'Test Component',
	...overrides,
});

// Helper to wait for a short time (for debounced operations)
export const waitForDebounce = (ms: number = 100) =>
	new Promise((resolve) => setTimeout(resolve, ms));

// Helper to simulate keyboard events
export const simulateKeyboard = async (
	element: Element,
	events: Array<{
		key: string;
		code?: string;
		shiftKey?: boolean;
		ctrlKey?: boolean;
		metaKey?: boolean;
	}>
) => {
	for (const event of events) {
		const keyboardEvent = new KeyboardEvent('keydown', {
			key: event.key,
			code: event.code,
			shiftKey: event.shiftKey || false,
			ctrlKey: event.ctrlKey || false,
			metaKey: event.metaKey || false,
			bubbles: true,
		});
		element.dispatchEvent(keyboardEvent);
		await waitForDebounce(10);
	}
};

// Helper to simulate typing
export const simulateTyping = async (
	element: HTMLElement,
	text: string
) => {
	element.focus();

	const isInput = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;

	if (isInput) {
		(element as HTMLInputElement).value = '';
	} else {
		element.innerHTML = '';
	}

	if (text.length === 0) {
		element.dispatchEvent(new Event('input', { bubbles: true }));
	} else {
		for (const char of text) {
			if (isInput) {
				(element as HTMLInputElement).value += char;
			} else {
				element.innerHTML += char;
			}
			element.dispatchEvent(new Event('input', { bubbles: true }));
			await waitForDebounce(10);
		}
	}
};

// Helper to check if element has specific CSS classes
export const hasClass = (element: Element, className: string) =>
	element.classList.contains(className);

// Helper to check if element is visible
export const isVisible = (element: HTMLElement) => {
	const style = window.getComputedStyle(element);
	return style.display !== 'none' && style.visibility !== 'hidden' && element.offsetWidth > 0;
};

// Mock data generators
export const generateMockText = (length: number = 100) =>
	'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '
		.repeat(Math.ceil(length / 50))
		.substring(0, length);

export const generateMockBase64 = () => 'SGVsbG8gV29ybGQh'; // "Hello World!" in base64

export const generateMockUri = () => 'https%3A//example.com/path%3Fquery%3Dvalue%20space';

// Performance testing helpers
export const measurePerformance = async (fn: () => void | Promise<void>) => {
	const start = performance.now();
	await fn();
	const end = performance.now();
	return end - start;
};
