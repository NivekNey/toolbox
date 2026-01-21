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
        const { text } = formatSQL(sql);
        expect(text).toContain('SELECT\n  *');
        expect(text).toContain('FROM users');
        expect(text).toContain('WHERE\n  id = 1');
    });

    it('should handle complex joins and nested queries', () => {
        const sql = 'select u.name, p.title from users u join posts p on u.id = p.user_id where u.active = 1 order by p.created_at desc';
        const { text } = formatSQL(sql);
        expect(text).toContain('JOIN posts');
        expect(text).toContain('ORDER BY');
    });

    it('should capitalize keywords', () => {
        const sql = 'update users set name = "test" where id = 5';
        const { text } = formatSQL(sql);
        expect(text).toContain('UPDATE users');
        expect(text).toContain('SET name = "test"');
    });

    it('should handle BigQuery syntax with optimal formatting', () => {
        const sql = `SELECT\n  -- Display the timestamp, and the part of the name that begins with test.\n  timestamp, REGEXP_EXTRACT(JSON_VALUE(json_payload.jobName), r".*(test.*)$") AS name,\nFROM\n  \`PROJECT_ID.LOCATION.BUCKET_ID.LOG_VIEW_ID\`\nWHERE\n  -- Get the value of jobName, which is a subfield in a JSON structure.\n  JSON_VALUE(json_payload.jobName) IS NOT NULL\nORDER BY timestamp DESC\nLIMIT 20`;
        const { text } = formatSQL(sql);

        const expected = `SELECT
  -- Display the timestamp, and the part of the name that begins with test.
  timestamp,
  REGEXP_EXTRACT (JSON_VALUE (json_payload.jobName),
  r".*(test.*)$") AS name
FROM \`PROJECT_ID.LOCATION.BUCKET_ID.LOG_VIEW_ID\`
WHERE
  -- Get the value of jobName, which is a subfield in a JSON structure.
  JSON_VALUE (json_payload.jobName) IS NOT NULL
ORDER BY timestamp DESC
LIMIT 20`;

        expect(text).toBe(expected);
    });

    it('should handle complex mixed-case queries with optimal formatting', () => {
        const sql = `SeLeCt U.id,u.NaMe,O.order_id,o.TOTAL from users U inner join orders O on u.id=o.user_id WHERE o.status='completed'and \nu.created_at>='2024-01-01'AnD o.total>100 group by u.id,u.name,o.order_id,\no.total having count(*)>1 ORDER BY o.total DESC;`;
        const { text } = formatSQL(sql);

        const expected = `SELECT
  U.id,
  u.NaMe,
  O.order_id,
  o.TOTAL
FROM users U
INNER JOIN orders O ON u.id = o.user_id
WHERE
  o.status = 'completed'
  AND u.created_at >= '2024-01-01'
  AND o.total > 100
GROUP BY
  u.id,
  u.name,
  o.order_id,
  o.total
HAVING
  COUNT (*) > 1
ORDER BY o.total DESC;`;

        expect(text).toBe(expected);
    });

    it('should handle Spark SQL and Snowflake specific syntax', () => {
        const snowflakeSql = 'copy into my_table from @my_stage file_format = (type = csv) deduplicate = true';
        const formattedSnowflake = formatSQL(snowflakeSql).text;
        expect(formattedSnowflake).toContain('COPY');
        expect(formattedSnowflake).toContain('FROM @my_stage');

        const sparkSql = 'with cte as (select 1) select * from cte pivot (sum(val) for col in (1, 2))';
        const formattedSpark = formatSQL(sparkSql).text;
        expect(formattedSpark).toContain('WITH\n  cte');
        expect(formattedSpark).toContain('PIVOT');
    });
});
