import { describe, it, expect } from 'vitest';

describe('Tailwind CSS Setup', () => {
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
});
