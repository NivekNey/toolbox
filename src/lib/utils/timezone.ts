/**
 * Timezone alignment utilities
 */

export interface TimezoneRow {
    name: string;
    offset: number;
    hours: HourPoint[];
}

export interface HourPoint {
    label: string;
    timestamp: number;
    isWorkingHours: boolean;
    isDST: boolean;
    hour: number;
    dayLabel: string;
    fullDate: string;
}

/**
 * Calculates a 48-hour grid for a specific timezone relative to a base date
 */
export function getTimezoneGrid(zone: string, baseDate: Date): TimezoneRow {
    const hours: HourPoint[] = [];

    const start = new Date(baseDate);
    start.setHours(0, 0, 0, 0);

    for (let i = 0; i < 48; i++) {
        const current = new Date(start.getTime() + i * 3600000);

        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: zone,
            hour: 'numeric',
            hour12: false,
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            timeZoneName: 'short'
        });

        const parts = formatter.formatToParts(current);
        const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
        const weekday = parts.find(p => p.type === 'weekday')?.value || '';
        const day = parts.find(p => p.type === 'day')?.value || '';
        const month = parts.find(p => p.type === 'month')?.value || '';
        const tzName = parts.find(p => p.type === 'timeZoneName')?.value || '';

        // DST detection: check if timezone name contains 'Summer' or 'Daylight'
        // Note: This is a heuristic that works for most English locales
        const isDST = /Summer|Daylight|DT/i.test(tzName);

        hours.push({
            label: `${hour}:00`,
            timestamp: current.getTime(),
            isWorkingHours: hour >= 9 && hour <= 18,
            isDST,
            hour,
            dayLabel: `${weekday} ${day}`,
            fullDate: `${weekday}, ${month} ${day}`
        });
    }

    // Calculate current offset accurately
    const now = new Date();
    const zoneDate = new Date(now.toLocaleString('en-US', { timeZone: zone }));
    const offset = Math.round((zoneDate.getTime() - now.getTime()) / 3600000);

    return {
        name: zone,
        offset,
        hours
    };
}

export const COMMON_TIMEZONES = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Sao_Paulo',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Moscow',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Bangkok',
    'Asia/Singapore',
    'Asia/Shanghai',
    'Asia/Tokyo',
    'Asia/Seoul',
    'Australia/Sydney',
    'Pacific/Auckland'
];

/**
 * Gets all IANA timezones supported by the browser
 */
export function getAllTimezones(): string[] {
    return (Intl as any).supportedValuesOf ? (Intl as any).supportedValuesOf('timeZone') : COMMON_TIMEZONES;
}
