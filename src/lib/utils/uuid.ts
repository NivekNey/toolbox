/**
 * UUID generation utilities
 */

export interface UUIDOptions {
    count?: number;
    uppercase?: boolean;
    noHyphens?: boolean;
}

/**
 * Generates one or more UUID v4 strings
 */
export function generateUUIDs(options: UUIDOptions = {}): string[] {
    const { count = 1, uppercase = false, noHyphens = false } = options;
    const uuids: string[] = [];

    for (let i = 0; i < count; i++) {
        let uuid = globalThis.crypto.randomUUID();

        if (noHyphens) {
            uuid = uuid.replace(/-/g, '');
        }

        if (uppercase) {
            uuid = uuid.toUpperCase();
        }

        uuids.push(uuid);
    }

    return uuids;
}
