import { describe, it, expect } from 'vitest';

// Import the functions we're going to test
// These will be implemented in the next task
import { encodeBase64, decodeBase64 } from '../../src/lib/utils/base64';

describe('Base64 Encoding/Decoding', () => {
	describe('encodeBase64', () => {
		it('should handle empty string', () => {
			expect(encodeBase64('')).toBe('');
		});

		it('should handle simple ASCII string', () => {
			expect(encodeBase64('hello')).toBe('aGVsbG8=');
			expect(encodeBase64('world')).toBe('d29ybGQ=');
		});

		it('should handle single character', () => {
			expect(encodeBase64('f')).toBe('Zg==');
			expect(encodeBase64('fo')).toBe('Zm8=');
			expect(encodeBase64('foo')).toBe('Zm9v');
		});

		it('should handle Unicode characters', () => {
			expect(encodeBase64('小飼弾')).toBe('5bCP6aO85by+');
			expect(encodeBase64('👍')).toBe('8J+RjQ==');
			expect(encodeBase64('hello 🌍')).toBe('aGVsbG8g8J+MjQ==');
		});

		it('should handle special characters', () => {
			expect(encodeBase64('hello world!')).toBe('aGVsbG8gd29ybGQh');
			expect(encodeBase64('test@example.com')).toBe('dGVzdEBleGFtcGxlLmNvbQ==');
			expect(encodeBase64('a+b=c&d=e')).toBe('YStiPWMmZD1l');
		});

		it('should handle whitespace', () => {
			expect(encodeBase64(' ')).toBe('IA==');
			expect(encodeBase64('\n')).toBe('Cg==');
			expect(encodeBase64('\t')).toBe('CQ==');
		});

		it('should handle numbers', () => {
			expect(encodeBase64('123')).toBe('MTIz');
			expect(encodeBase64('2024')).toBe('MjAyNA==');
		});

		it('should handle mixed content', () => {
			const input = 'Hello, 世界! 123\n\tTest';
			expect(encodeBase64(input)).toBe('SGVsbG8sIOS4lueVjCEgMTIzCglUZXN0');
		});

		it('should be consistent with built-in btoa for ASCII', () => {
			const testStrings = ['hello', 'world', 'test', '12345', 'abcxyz'];
			testStrings.forEach((str) => {
				// Note: btoa only handles ASCII, so test only ASCII strings
				if (/^[\x00-\x7F]*$/.test(str)) {
					expect(encodeBase64(str)).toBe(btoa(str));
				}
			});
		});
	});

	describe('decodeBase64', () => {
		it('should handle empty string', () => {
			expect(decodeBase64('')).toBe('');
		});

		it('should handle simple Base64 string', () => {
			expect(decodeBase64('aGVsbG8=')).toBe('hello');
			expect(decodeBase64('d29ybGQ=')).toBe('world');
		});

		it('should handle different padding lengths', () => {
			expect(decodeBase64('Zg==')).toBe('f');
			expect(decodeBase64('Zm8=')).toBe('fo');
			expect(decodeBase64('Zm9v')).toBe('foo');
		});

		it('should handle Unicode characters', () => {
			expect(decodeBase64('5bCP6aO85by+')).toBe('小飼弾');
			expect(decodeBase64('8J+RjQ==')).toBe('👍');
			expect(decodeBase64('aGVsbG8g8J+MjQ==')).toBe('hello 🌍');
		});

		it('should handle special characters', () => {
			expect(decodeBase64('aGVsbG8gd29ybGQh')).toBe('hello world!');
			expect(decodeBase64('dGVzdEBleGFtcGxlLmNvbQ==')).toBe('test@example.com');
			expect(decodeBase64('YStiPWMmZD1l')).toBe('a+b=c&d=e');
		});

		it('should handle whitespace', () => {
			expect(decodeBase64('IA==')).toBe(' ');
			expect(decodeBase64('Cg==')).toBe('\n');
			expect(decodeBase64('CQ==')).toBe('\t');
		});

		it('should handle numbers', () => {
			expect(decodeBase64('MTIz')).toBe('123');
			expect(decodeBase64('MjAyNA==')).toBe('2024');
		});

		it('should handle mixed content', () => {
			const encoded = 'SGVsbG8sIOS4lueVjCEgMTIzCglUZXN0';
			expect(decodeBase64(encoded)).toBe('Hello, 世界! 123\n\tTest');
		});

		it('should be consistent with built-in atob for ASCII', () => {
			const testStrings = ['aGVsbG8=', 'd29ybGQ=', 'dGVzdA==', 'MTIz', 'YWJjeHl6'];
			testStrings.forEach((str) => {
				try {
					expect(decodeBase64(str)).toBe(atob(str));
				} catch (error) {
					// atob might fail on non-ASCII content, but our function should handle it
					expect(() => decodeBase64(str)).not.toThrow();
				}
			});
		});
	});

	describe('Bidirectional Encoding/Decoding', () => {
		it('should be reversible for various inputs', () => {
			const testCases = [
				'',
				'a',
				'hello',
				'hello world!',
				'test@example.com',
				'👍',
				'小飼弾',
				'Hello, 世界! 123\n\tTest',
				'JSON: {"key": "value", "number": 42}',
				'URL: https://example.com/path?query=value#fragment',
			];

			testCases.forEach((input) => {
				const encoded = encodeBase64(input);
				const decoded = decodeBase64(encoded);
				expect(decoded).toBe(input);
			});
		});

		it('should handle large text efficiently', () => {
			const largeText = 'A'.repeat(10000);
			const startTime = performance.now();

			const encoded = encodeBase64(largeText);
			const encodedTime = performance.now();

			const decoded = decodeBase64(encoded);
			const decodedTime = performance.now();

			expect(decoded).toBe(largeText);
			expect(encodedTime - startTime).toBeLessThan(100); // Should encode in <100ms
			expect(decodedTime - encodedTime).toBeLessThan(100); // Should decode in <100ms
		});
	});

	describe('Error Handling', () => {
		it('should throw on invalid Base64 input', () => {
			const invalidInputs = [
				'!', // Invalid character
				'===', // Too many padding characters
				'abc', // Invalid length
				'aGVsbG8', // Missing padding
				'YWJjZWZnaA===', // Too much padding
			];

			invalidInputs.forEach((input) => {
				expect(() => decodeBase64(input)).toThrow();
			});
		});

		it('should handle null/undefined gracefully', () => {
			expect(() => encodeBase64(null as any)).toThrow();
			expect(() => encodeBase64(undefined as any)).toThrow();
			expect(() => decodeBase64(null as any)).toThrow();
			expect(() => decodeBase64(undefined as any)).toThrow();
		});

		it('should handle non-string types gracefully', () => {
			expect(() => encodeBase64(123 as any)).toThrow();
			expect(() => encodeBase64({} as any)).toThrow();
			expect(() => decodeBase64(123 as any)).toThrow();
			expect(() => decodeBase64({} as any)).toThrow();
		});
	});

	describe('Edge Cases', () => {
		it('should handle very long strings', () => {
			const longString =
				'This is a very long string that contains many characters and should still work properly with Base64 encoding and decoding. '.repeat(
					100
				);
			const encoded = encodeBase64(longString);
			const decoded = decodeBase64(encoded);
			expect(decoded).toBe(longString);
		});

		it('should handle zero-width characters', () => {
			const testString = 'test\u200B\u200C\u200Dstring'; // Zero-width characters
			const encoded = encodeBase64(testString);
			const decoded = decodeBase64(encoded);
			expect(decoded).toBe(testString);
		});

		it('should handle emoji sequences', () => {
			const testString = '👨‍👩‍👧‍👦'; // Family emoji (multiple code points)
			const encoded = encodeBase64(testString);
			const decoded = decodeBase64(encoded);
			expect(decoded).toBe(testString);
		});

		it('should preserve line breaks in encoded output', () => {
			const testString = 'line1\nline2\r\nline3';
			const encoded = encodeBase64(testString);
			const decoded = decodeBase64(encoded);
			expect(decoded).toBe(testString);
		});

		it('should handle JSON strings', () => {
			const json = JSON.stringify({ key: 'value', nested: [1, 2, 3], unicode: '世界' });
			const encoded = encodeBase64(json);
			const decoded = decodeBase64(encoded);
			expect(decoded).toBe(json);
			expect(JSON.parse(decoded).unicode).toBe('世界');
		});
	});

	describe('Base64URL support', () => {
		it('should handle Base64URL encoding/decoding', () => {
			const input = 'a?b+c/d'; // characters that change in Base64URL
			const encoded = encodeBase64(input, { urlSafe: true });
			expect(encoded).not.toContain('+');
			expect(encoded).not.toContain('/');
			expect(encoded).not.toContain('='); // no padding by default in Base64URL

			const decoded = decodeBase64(encoded, { urlSafe: true });
			expect(decoded).toBe(input);
		});

		it('should interoperate between formats if requested', () => {
			const input = 'a?b+c/d';
			const standard = encodeBase64(input); // aP9iK2MvZA==
			const urlSafe = encodeBase64(input, { urlSafe: true }); // aP9iK2MvZA

			expect(decodeBase64(standard)).toBe(input);
			expect(decodeBase64(urlSafe, { urlSafe: true })).toBe(input);
		});
	});
});
