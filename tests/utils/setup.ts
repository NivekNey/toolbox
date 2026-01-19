// Re-export test utilities for easier imports
export * from '../../src/lib/test-utils';

// Additional test setup for components
import { afterEach, beforeEach } from 'vitest';

// Clean up DOM after each test
afterEach(() => {
	document.body.innerHTML = '';
});

// Setup consistent DOM before each test
beforeEach(() => {
	document.body.innerHTML = '';
});
