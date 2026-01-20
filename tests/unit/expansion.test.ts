import { describe, it, expect } from 'vitest';
import { generateUUIDs } from '../../src/lib/utils/uuid';
import { convertTimestamp } from '../../src/lib/utils/timestamp';
import { formatSQL } from '../../src/lib/utils/sqlFormatter';

describe('UUID Utility', () => {
    it('should generate a valid UUID v4', () => {
        const [uuid] = generateUUIDs();
        expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate multiple UUIDs', () => {
        const uuids = generateUUIDs({ count: 5 });
        expect(uuids).toHaveLength(5);
        expect(new Set(uuids).size).toBe(5);
    });

    it('should respect formatting options', () => {
        const [uuid] = generateUUIDs({ uppercase: true, noHyphens: true });
        expect(uuid).toMatch(/^[0-9A-F]{32}$/);
    });
});

describe('Timestamp Utility', () => {
    it('should convert unix seconds correctly', () => {
        const parts = convertTimestamp(1705680000); // 2024-01-19
        expect(parts?.iso).toBe('2024-01-19T16:00:00.000Z');
        expect(parts?.unix).toBe(1705680000);
    });

    it('should handle millisecond timestamps', () => {
        const parts = convertTimestamp(1705680000000);
        expect(parts?.iso).toBe('2024-01-19T16:00:00.000Z');
    });

    it('should handle ISO strings', () => {
        const parts = convertTimestamp('2024-01-19T16:00:00.000Z');
        expect(parts?.unix).toBe(1705680000);
    });

    it('should return null for invalid input', () => {
        expect(convertTimestamp('invalid')).toBeNull();
    });
});

describe('SQL Formatter Utility', () => {
    it('should format simple SELECT queries', () => {
        const sql = 'select * from users where id = 1';
        const formatted = formatSQL(sql);
        expect(formatted).toContain('SELECT *');
        expect(formatted).toContain('\nFROM users');
        expect(formatted).toContain('\nWHERE id = 1');
    });

    it('should handle complex joins and nested queries', () => {
        const sql = 'select u.name, p.title from users u join posts p on u.id = p.user_id where u.active = 1 order by p.created_at desc';
        const formatted = formatSQL(sql);
        expect(formatted).toContain('JOIN posts');
        expect(formatted).toContain('\nORDER BY');
    });

    it('should capitalize keywords', () => {
        const sql = 'update users set name = "test" where id = 5';
        const formatted = formatSQL(sql);
        expect(formatted).toContain('UPDATE users');
        expect(formatted).toContain('SET name = "test"');
    });
});
