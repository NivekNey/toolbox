import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import { simulateTyping, waitForDebounce } from '../utils/setup';
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

	it('should render correctly', () => {
		render(Base64Tool);
		expect(document.querySelector('[data-testid="plain-editor"]')).toBeTruthy();
		expect(document.querySelector('[data-testid="base64-editor"]')).toBeTruthy();
	});

	it('should encode from Plain to Base64', async () => {
		render(Base64Tool);
		const plainInput = document.querySelector('[data-testid="plain-editor-textarea"]') as HTMLTextAreaElement;
		const base64Input = document.querySelector('[data-testid="base64-editor-textarea"]') as HTMLTextAreaElement;

		await simulateTyping(plainInput, 'hello');
		await waitForDebounce(200);

		expect(base64Input.value).toBe('aGVsbG8=');
	});

	it('should decode from Base64 to Plain', async () => {
		render(Base64Tool);
		const plainInput = document.querySelector('[data-testid="plain-editor-textarea"]') as HTMLTextAreaElement;
		const base64Input = document.querySelector('[data-testid="base64-editor-textarea"]') as HTMLTextAreaElement;

		await simulateTyping(base64Input, 'aGVsbG8=');
		await waitForDebounce(200);

		expect(plainInput.value).toBe('hello');
	});

	it('should show error for invalid Base64', async () => {
		render(Base64Tool);
		const base64Input = document.querySelector('[data-testid="base64-editor-textarea"]') as HTMLTextAreaElement;

		await simulateTyping(base64Input, 'invalid!');
		await waitForDebounce(200);

		const errorMessage = document.querySelector('[data-testid="error-message"]');
		expect(errorMessage?.textContent).toBe('Invalid Base64 format');
	});
});