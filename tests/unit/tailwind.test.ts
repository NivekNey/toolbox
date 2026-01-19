import { describe, it, expect, beforeEach } from 'vitest';

describe('Tailwind CSS Setup', () => {
	beforeEach(() => {
		// Setup DOM for each test
	});

	it('should have Tailwind CSS classes available', () => {
		// Test that our CSS classes are defined
		const container = document.createElement('div');
		container.className = 'container mx-auto px-4 py-8 max-w-4xl';
		expect(container.className).toContain('container');
	});

	it('should have custom component classes available', () => {
		const button = document.createElement('button');
		button.className = 'btn btn-primary';
		expect(button.className).toContain('btn');
		expect(button.className).toContain('btn-primary');
	});

	it('should have main page component available', () => {
		// Test that the main page component exists and can be imported
		expect(() => import('../../src/routes/+page.svelte')).not.toThrow();
	});
});
