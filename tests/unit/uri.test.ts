import { describe, it, expect } from 'vitest';

// Import the functions we're going to test
// These will be implemented in the next task
import { encodeURI, decodeURI, isURIEncoded } from '../../src/lib/utils/uri';

describe('URI Encoding/Decoding', () => {
	describe('encodeURI', () => {
		it('should handle empty string', () => {
			expect(encodeURI('')).toBe('');
		});

		it('should handle simple ASCII URL', () => {
			expect(encodeURI('https://example.com')).toBe('https://example.com');
			expect(encodeURI('http://example.com/path')).toBe('http://example.com/path');
			expect(encodeURI('https://example.com/path?query=value')).toBe('https://example.com/path?query=value');
		});

		it('should encode spaces', () => {
			expect(encodeURI('hello world')).toBe('hello%20world');
			expect(encodeURI(' ')).toBe('%20');
			expect(encodeURI('\n')).toBe('%0A');
			expect(encodeURI('\t')).toBe('%09');
		});

		it('should encode special characters', () => {
			expect(encodeURI('a+b=c&d=e')).toBe('a%2Bb%3Dc%26d%3De');
			expect(encodeURI('test@example.com')).toBe('test%40example.com');
			expect(encodeURI('name=value&other=data')).toBe('name%3Dvalue%26other%3Ddata');
		});

		it('should encode reserved characters', () => {
			expect(encodeURI('/path/to/file')).toBe('%2Fpath%2Fto%2Ffile');
			expect(encodeURI('?query=test')).toBe('%3Fquery%3Dtest');
			expect(encodeURI('#fragment')).toBe('%23fragment');
		});

		it('should encode Unicode characters', () => {
			expect(encodeURI('https://example.com/测试')).toBe('https://example.com/%E6%B5%8B%95%8B');
			expect(encodeURI('https://example.com/🌍')).toBe('https://example.com/%F0%9F%8D');
			expect(encodeURI('café')).toBe('caf%C3%A9');
		});

		it('should handle mixed content', () => {
			const input = 'https://example.com/path?query=测试 value&name=🌍';
			expect(encodeURI(input)).toBe('https://example.com/path?query%3D%E6%B5%8B%95%8B%20value%26name%3D%F0%9F%8D');
		});

		it('should be consistent with built-in encodeURIComponent', () => {
			const testStrings = [
				'https://example.com',
				'hello world',
				'test@example.com',
				'a+b=c&d=e',
				'/path/to/file',
				'café',
				'https://example.com/测试'
			];

			testStrings.forEach(str => {
				expect(encodeURI(str)).toBe(encodeURIComponent(str));
			});
		});
	});

	describe('decodeURI', () => {
		it('should handle empty string', () => {
			expect(decodeURI('')).toBe('');
		});

		it('should handle simple ASCII URL', () => {
			expect(decodeURI('https://example.com')).toBe('https://example.com');
			expect(decodeURI('http://example.com/path')).toBe('http://example.com/path');
			expect(decodeURI('https://example.com/path?query=value')).toBe('https://example.com/path?query=value');
		});

		it('should decode spaces', () => {
			expect(decodeURI('hello%20world')).toBe('hello world');
			expect(decodeURI('%20')).toBe(' ');
			expect(decodeURI('%0A')).toBe('\n');
			expect(decodeURI('%09')).toBe('\t');
		});

		it('should decode special characters', () => {
			expect(decodeURI('a%2Bb%3Dc%26d%3De')).toBe('a+b=c&d=e');
			expect(decodeURI('test%40example.com')).toBe('test@example.com');
			expect(decodeURI('name%3Dvalue%26other%3Ddata')).toBe('name=value&other=data');
		});

		it('should decode reserved characters', () => {
			expect(decodeURI('%2Fpath%2Fto%2Ffile')).toBe('/path/to/file');
			expect(decodeURI('%3Fquery%3Dtest')).toBe('?query=test');
			expect(decodeURI('%23fragment')).toBe('#fragment');
		});

		it('should decode Unicode characters', () => {
			expect(decodeURI('https://example.com/%E6%B5%8B%95%8B')).toBe('https://example.com/测试');
			expect(decodeURI('https://example.com/%F0%9F%8D')).toBe('https://example.com/🌍');
			expect(decodeURI('caf%C3%A9')).toBe('café');
		});

		it('should handle mixed content', () => {
			const encoded = 'https://example.com/path?query%3D%E6%B5%8B%95%8B%20value%26name%3D%F0%9F%8D';
			expect(decodeURI(encoded)).toBe('https://example.com/path?query=测试 value&name=🌍');
		});

		it('should be consistent with built-in decodeURIComponent', () => {
			const testStrings = [
				'https://example.com',
				'hello world',
				'test@example.com',
				'a%2Bb%3Dc%26d%3De',
				'%2Fpath%2Fto%2Ffile',
				'caf%C3%A9',
				'https://example.com/%E6%B5%8B%95%8B'
			];

			testStrings.forEach(str => {
				expect(decodeURI(str)).toBe(decodeURIComponent(str));
			});
		});
	});

	describe('Bidirectional Encoding/Decoding', () => {
		it('should be reversible for various inputs', () => {
			const testCases = [
				'',
				'https://example.com',
				'hello world',
				'a+b=c&d=e',
				'test@example.com',
				'café',
				'https://example.com/测试',
				'https://example.com/🌍'
			];

			testCases.forEach(input => {
				const encoded = encodeURI(input);
				const decoded = decodeURI(encoded);
				expect(decoded).toBe(input);
			});
		});
	});

	describe('Error Handling', () => {
		it('should throw on invalid input for encoding', () => {
			expect(() => encodeURI(null as any)).toThrow();
			expect(() => encodeURI(undefined as any)).toThrow();
			expect(() => encodeURI(123 as any)).toThrow();
			expect(() => encodeURI({} as any)).toThrow();
		});

		it('should throw on invalid input for decoding', () => {
			expect(() => decodeURI(null as any)).toThrow();
			expect(() => decodeURI(undefined as any)).toThrow();
			expect(() => decodeURI(123 as any)).toThrow();
			expect(() => decodeURI({} as any)).toThrow();
		});
	});

	describe('Edge Cases', () => {
		it('should handle partial encoding', () => {
			expect(encodeURI('start%middle%end')).toBe('start%25middle%25end');
			expect(decodeURI('start%25middle%25end')).toBe('start%middle%end');
		});

		it('should handle already encoded strings', () => {
			const alreadyEncoded = 'hello%20world';
			expect(encodeURI(alreadyEncoded)).toBe('hello%2520world%2520');
			expect(decodeURI(alreadyEncoded)).toBe('hello%20world');
		});

		it('should handle very long URLs', () => {
			const longURL = 'https://example.com/' + 'path/'.repeat(100) + '?' + 'param='.repeat(50) + 'value';
			const encoded = encodeURI(longURL);
			const decoded = decodeURI(encoded);
			
			expect(decoded).toBe(longURL);
		});

		it('should handle multiple consecutive spaces', () => {
			const input = 'hello  world   test';
			expect(encodeURI(input)).toBe('hello%20%20%20world%20%20%20test');
			expect(decodeURI('hello%20%20%20world%20%20test')).toBe(input);
		});

		it('should preserve protocol and auth', () => {
			const authURL = 'https://user:pass@example.com/path';
			expect(encodeURI(authURL)).toBe('https://user:pass@example.com/path');
			expect(decodeURI('https://user:pass@example.com/path')).toBe(authURL);
		});
	});

	describe('Performance', () => {
		it('should handle large strings efficiently', () => {
			const largeString = 'https://example.com/' + 'path/'.repeat(1000);
			
			const startTime = performance.now();
			const encoded = encodeURI(largeString);
			const encodedTime = performance.now();
			
			const decoded = decodeURI(encoded);
			const decodedTime = performance.now();
			
			expect(decoded).toBe(largeString);
			expect(encodedTime - startTime).toBeLessThan(100); // Should encode in <100ms
			expect(decodedTime - encodedTime).toBeLessThan(100); // Should decode in <100ms
		});
	});

	describe('isURIEncoded', () => {
		it('should detect URI-encoded strings', () => {
			expect(isURIEncoded('hello%20world')).toBe(true);
			expect(isURIEncoded('https://example.com')).toBe(true);
			expect(isURIEncoded('a%2Bb')).toBe(true);
			expect(isURIEncoded('test%40example.com')).toBe(true);
		});

		it('should reject non-URI-encoded strings', () => {
			expect(isURIEncoded('hello world')).toBe(false);
			expect(isURIEncoded('hello world!')).toBe(false);
			expect(isURIEncoded('test@example.com')).toBe(false);
			expect(isURIEncoded('a+b=c&d=e')).toBe(false);
		});

		it('should handle edge cases', () => {
			expect(isURIEncoded('')).toBe(false);
			expect(isURIEncoded('%')).toBe(false);
			expect(isURIEncoded('hello%2')).toBe(false); // Incomplete encoding
		});
	});
});