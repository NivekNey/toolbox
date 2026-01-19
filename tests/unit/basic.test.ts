import { describe, it, expect, beforeEach } from 'vitest';

describe('Basic Setup', () => {
	beforeEach(() => {
		// Setup DOM for each test
	});

	it('should pass a basic math test', () => {
		expect(1 + 1).toBe(2);
	});

	it('should have proper test environment', () => {
		expect(document).toBeDefined();
		expect(window).toBeDefined();
		expect(typeof performance).toBe('object');
	});

	it('should have mock clipboard API available', () => {
		expect(navigator.clipboard).toBeDefined();
		expect(typeof navigator.clipboard.writeText).toBe('function');
	});
});
