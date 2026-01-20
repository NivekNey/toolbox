/**
 * Unix Timestamp utilities
 */

export interface TimestampParts {
    unix: number;
    iso: string;
    utc: string;
    local: string;
    relative: string;
}

/**
 * Converts a value to various timestamp formats
 */
export function convertTimestamp(input: string | number): TimestampParts | null {
    let date: Date;

    if (!input && input !== 0) return null;

    if (typeof input === 'string') {
        // Handle scientific notation or large numbers as strings
        if (/^\d+(\.\d+)?$/.test(input)) {
            const n = parseFloat(input);
            // Try to detect if it's ms or seconds
            date = new Date(n > 10000000000 ? n : n * 1000);
        } else {
            date = new Date(input);
        }
    } else {
        date = new Date(input > 10000000000 ? input : input * 1000);
    }

    if (isNaN(date.getTime())) return null;

    const now = new Date();
    const diff = Math.floor((date.getTime() - now.getTime()) / 1000);
    let relative = '';

    if (Math.abs(diff) < 60) relative = diff < 0 ? 'just now' : 'soon';
    else if (Math.abs(diff) < 3600) relative = `${Math.abs(Math.floor(diff / 60))}m ${diff < 0 ? 'ago' : 'from now'}`;
    else if (Math.abs(diff) < 86400) relative = `${Math.abs(Math.floor(diff / 3600))}h ${diff < 0 ? 'ago' : 'from now'}`;
    else relative = `${Math.abs(Math.floor(diff / 86400))}d ${diff < 0 ? 'ago' : 'from now'}`;

    return {
        unix: Math.floor(date.getTime() / 1000),
        iso: date.toISOString(),
        utc: date.toUTCString(),
        local: date.toLocaleString(),
        relative
    };
}
