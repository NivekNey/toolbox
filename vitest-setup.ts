import '@testing-library/jest-dom/vitest';
import { expect, vi } from 'vitest';
import type { Navigation, Page } from '@sveltejs/kit';
import { readable } from 'svelte/store';
import * as environment from '$app/environment';
import * as navigation from '$app/navigation';
import * as stores from '$app/stores';

// Add custom jest matchers
expect.extend({
	received: {
		toBeInTheDocument: () => ({
			pass: !!document.body.contains(received),
			message: () => `expected element ${received ? 'not ' : ''}to be in the document`,
		}),
	},
});

// Mock SvelteKit runtime module $app/environment
vi.mock('$app/environment', (): typeof environment => ({
	browser: true,
	dev: true,
	building: false,
	version: 'any',
}));

// Mock SvelteKit runtime module $app/navigation
vi.mock('$app/navigation', (): typeof navigation => ({
	afterNavigate: () => {},
	beforeNavigate: () => {},
	disableScrollHandling: () => {},
	goto: () => Promise.resolve(),
	invalidate: () => Promise.resolve(),
	invalidateAll: () => Promise.resolve(),
	preloadData: () => Promise.resolve(),
	preloadCode: () => Promise.resolve(),
}));

// Mock SvelteKit runtime module $app/stores
vi.mock('$app/stores', (): typeof stores => {
	const getStores: typeof stores.getStores = () => {
		const navigating = readable<Navigation | null>(null);
		const page = readable<Page>({
			url: new URL('http://localhost:5173'),
			params: {},
			route: {
				id: null,
			},
			status: 200,
			error: null,
			data: {},
			form: undefined,
		});
		const updated = { subscribe: readable(false).subscribe, check: async () => false };

		return { navigating, page, updated };
	};

	const page: typeof stores.page = {
		subscribe(fn) {
			return getStores().page.subscribe(fn);
		},
	};
	const navigating: typeof stores.navigating = {
		subscribe(fn) {
			return getStores().navigating.subscribe(fn);
		},
	};
	const updated: typeof stores.updated = {
		subscribe(fn) {
			return getStores().updated.subscribe(fn);
		},
		check: async () => false,
	};

	return {
		getStores,
		navigating,
		page,
		updated,
	};
});

// Mock clipboard API
Object.assign(navigator, {
	clipboard: {
		writeText: vi.fn().mockResolvedValue(undefined),
		readText: vi.fn().mockResolvedValue(''),
	},
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
}));

// Setup DOM for testing
document.body.innerHTML = '';

// Global test utilities
global.createEvent = (type: string, target: EventTarget) => {
	const event = new Event(type, { bubbles: true, cancelable: true });
	Object.defineProperty(event, 'target', { writable: false, value: target });
	return event;
};

global.createKeyboardEvent = (type: string, key: string, target: EventTarget) => {
	const event = new KeyboardEvent(type, {
		key,
		bubbles: true,
		cancelable: true,
	});
	Object.defineProperty(event, 'target', { writable: false, value: target });
	return event;
};
