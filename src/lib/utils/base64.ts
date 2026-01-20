/**
 * Base64 encoding and decoding utilities
 * Supports Unicode characters and handles edge cases properly
 */

/**
 * Validates if a string is valid Base64
 */
export function isValidBase64(str: string): boolean {
	if (typeof str !== 'string') return false;

	// Empty string is valid
	if (str === '') return true;

	// Base64 should only contain these characters and padding
	const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
	if (!base64Regex.test(str)) return false;

	// Check for proper padding
	const paddingIndex = str.indexOf('=');
	if (paddingIndex !== -1) {
		const padding = str.slice(paddingIndex);
		// Padding should only be at the end and max 2 characters
		if (!/^(={0,2})$/.test(padding)) return false;
		// Length should be divisible by 4 if there's padding
		if (str.length % 4 !== 0) return false;
	}

	// Length without padding should be divisible by 4
	const unpaddedLength = paddingIndex === -1 ? str.length : paddingIndex;
	if (unpaddedLength % 4 !== 0 && paddingIndex === -1) return false;

	return true;
}

/**
 * Converts a string to Base64 encoding
 * Handles Unicode characters properly using UTF-8 encoding
 */
export function encodeBase64(input: string): string {
	// Type validation
	if (typeof input !== 'string') {
		throw new TypeError('Input must be a string');
	}

	// Handle empty string
	if (input === '') return '';

	// Use built-in btoa for browser compatibility
	// Convert to UTF-8 first to handle Unicode properly
	try {
		// For modern browsers, we can handle Unicode properly
		const utf8Bytes = new TextEncoder().encode(input);
		let binaryString = '';

		// Convert bytes to binary string
		for (const byte of utf8Bytes) {
			binaryString += String.fromCharCode(byte);
		}

		return btoa(binaryString);
	} catch (error) {
		// Fallback for older browsers or edge cases
		// Manual Base64 encoding
		const utf8Bytes = new TextEncoder().encode(input);
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
		let result = '';
		let i = 0;

		while (i < utf8Bytes.length) {
			const a = utf8Bytes[i++];
			const b = i < utf8Bytes.length ? utf8Bytes[i++] : 0;
			const c = i < utf8Bytes.length ? utf8Bytes[i++] : 0;

			const bitmap = (a << 16) | (b << 8) | c;

			result += chars.charAt((bitmap >> 18) & 63);
			result += chars.charAt((bitmap >> 12) & 63);
			result += i - 2 < utf8Bytes.length ? chars.charAt((bitmap >> 6) & 63) : '=';
			result += i - 1 < utf8Bytes.length ? chars.charAt(bitmap & 63) : '=';
		}

		return result;
	}
}

/**
 * Converts a Base64 encoded string back to the original string
 * Handles Unicode characters and validates input
 */
export function decodeBase64(input: string): string {
	// Type validation
	if (typeof input !== 'string') {
		throw new TypeError('Input must be a string');
	}

	// Handle empty string
	if (input === '') return '';

	// Validate Base64 format
	if (!isValidBase64(input)) {
		throw new Error('Invalid Base64 input');
	}

	try {
		// Use built-in atob for browser compatibility
		const binaryString = atob(input);

		// Convert binary string back to UTF-8 bytes, then to string
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}

		return new TextDecoder().decode(bytes);
	} catch (error) {
		// Fallback manual Base64 decoding
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
		let result = '';
		let i = 0;

		input = input.replace(/[^A-Za-z0-9+/]/g, '');

		while (i < input.length) {
			const encoded1 = chars.indexOf(input.charAt(i++));
			const encoded2 = i < input.length ? chars.indexOf(input.charAt(i++)) : 0;
			const encoded3 = i < input.length ? chars.indexOf(input.charAt(i++)) : 0;
			const encoded4 = i < input.length ? chars.indexOf(input.charAt(i++)) : 0;

			const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;

			result += String.fromCharCode((bitmap >> 16) & 255);
			if (encoded3 !== 64) result += String.fromCharCode((bitmap >> 8) & 255);
			if (encoded4 !== 64) result += String.fromCharCode(bitmap & 255);
		}

		// Convert to bytes and decode as UTF-8
		const bytes = new Uint8Array(result.length);
		for (let j = 0; j < result.length; j++) {
			bytes[j] = result.charCodeAt(j);
		}

		return new TextDecoder().decode(bytes);
	}
}

/**
 * Checks if a string is likely Base64 encoded
 * This is a heuristic, not a definitive check
 */
export function isBase64Encoded(input: string): boolean {
	if (typeof input !== 'string' || input === '') return false;

	// Basic format check
	if (!isValidBase64(input)) return false;

	// Length check - Base64 strings are typically longer than the original
	// This is just a heuristic
	return input.length % 4 === 0;
}
