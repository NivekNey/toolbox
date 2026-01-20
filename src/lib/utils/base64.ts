export interface Base64Options {
	urlSafe?: boolean;
}

/**
 * Validates if a string is valid Base64 or Base64URL
 */
export function isValidBase64(str: string, options: Base64Options = {}): boolean {
	if (typeof str !== 'string') return false;
	if (str === '') return true;

	const { urlSafe = false } = options;

	if (urlSafe) {
		// Base64URL uses - and _ instead of + and / and typically no padding
		const base64UrlRegex = /^[A-Za-z0-9\-_]*={0,2}$/;
		if (!base64UrlRegex.test(str)) return false;
	} else {
		const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
		if (!base64Regex.test(str)) return false;
	}

	const paddingIndex = str.indexOf('=');
	if (paddingIndex !== -1) {
		const padding = str.slice(paddingIndex);
		if (!/^(={0,2})$/.test(padding)) return false;
		if (str.length % 4 !== 0) return false;
	} else if (!urlSafe && str.length % 4 !== 0) {
		// Standard Base64 requires padding/length divisible by 4
		return false;
	}

	return true;
}

/**
 * Converts a string to Base64 encoding
 * Handles Unicode characters properly using UTF-8 encoding
 */
export function encodeBase64(input: string, options: Base64Options = {}): string {
	if (typeof input !== 'string') {
		throw new TypeError('Input must be a string');
	}
	if (input === '') return '';

	const { urlSafe = false } = options;

	const utf8Bytes = new TextEncoder().encode(input);
	let binaryString = '';

	// More efficient for large strings than += in a loop
	const CHUNK_SIZE = 8192;
	for (let i = 0; i < utf8Bytes.length; i += CHUNK_SIZE) {
		const chunk = utf8Bytes.subarray(i, i + CHUNK_SIZE);
		binaryString += String.fromCharCode.apply(null, chunk as any);
	}

	let base64 = btoa(binaryString);

	if (urlSafe) {
		base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
	}

	return base64;
}

/**
 * Converts a Base64 encoded string back to the original string
 * Handles Unicode characters and validates input
 */
export function decodeBase64(input: string, options: Base64Options = {}): string {
	if (typeof input !== 'string') {
		throw new TypeError('Input must be a string');
	}
	if (input === '') return '';

	const { urlSafe = false } = options;

	let normalizedInput = input;
	if (urlSafe) {
		normalizedInput = input.replace(/-/g, '+').replace(/_/g, '/');
		// Add padding back if missing
		while (normalizedInput.length % 4 !== 0) {
			normalizedInput += '=';
		}
	}

	if (!isValidBase64(normalizedInput)) {
		throw new Error('Invalid Base64 input');
	}

	try {
		const binaryString = atob(normalizedInput);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}

		return new TextDecoder().decode(bytes);
	} catch (error) {
		throw new Error('Decoding failed: ' + (error instanceof Error ? error.message : String(error)));
	}
}

/**
 * Checks if a string is likely Base64 encoded
 */
export function isBase64Encoded(input: string, options: Base64Options = {}): boolean {
	if (typeof input !== 'string' || input === '') return false;
	return isValidBase64(input, options);
}
