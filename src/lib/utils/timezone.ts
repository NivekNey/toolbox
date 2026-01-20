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
    isDaylight: boolean;
    hour: number;
    dayLabel: string;
}

/**
 * Calculates a 48-hour grid for a specific timezone relative to a base date
 */
export function getTimezoneGrid(zone: string, baseDate: Date): TimezoneRow {
    const hours: HourPoint[] = [];

    // Start from the beginning of the baseDate
    const start = new Date(baseDate);
    start.setHours(0, 0, 0, 0);

    for (let i = 0; i < 48; i++) {
        const current = new Date(start.getTime() + i * 3600000);

        // Use Intl to get the localized time for this zone
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: zone,
            hour: 'numeric',
            hour12: false,
            weekday: 'short',
            day: 'numeric'
        });

        const parts = formatter.formatToParts(current);
        const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
        const weekday = parts.find(p => p.type === 'weekday')?.value || '';
        const day = parts.find(p => p.type === 'day')?.value || '';

        hours.push({
            label: `${hour}:00`,
            timestamp: current.getTime(),
            isDaylight: hour >= 8 && hour <= 19,
            hour,
            dayLabel: `${weekday} ${day}`
        });
    }

    // Calculate current offset (approximation)
    const local = new Date().getTime();
    const zoneDate = new Date(new Intl.DateTimeFormat('en-US', { timeZone: zone }).format(new Date()));
    const offset = Math.round((zoneDate.getTime() - local) / 3600000);

    return {
        name: zone,
        offset,
        hours
    };
}

export const COMMON_TIMEZONES = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Singapore',
    'Asia/Kolkata',
    'Australia/Sydney'
];
