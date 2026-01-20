import { describe, it, expect, beforeEach } from 'vitest';
import { paletteVisible, activeTool, togglePalette, openPalette, closePalette, selectTool } from '$lib/stores/palette';
import { get } from 'svelte/store';

describe('Palette Store', () => {
    beforeEach(() => {
        closePalette();
        activeTool.set('all');
    });

    it('should have initial state', () => {
        expect(get(paletteVisible)).toBe(false);
        expect(get(activeTool)).toBe('all');
    });

    it('should toggle palette', () => {
        togglePalette();
        expect(get(paletteVisible)).toBe(true);
        togglePalette();
        expect(get(paletteVisible)).toBe(false);
    });

    it('should open and close palette', () => {
        openPalette();
        expect(get(paletteVisible)).toBe(true);
        closePalette();
        expect(get(paletteVisible)).toBe(false);
    });

    it('should set active tool and close palette when calling selectTool', () => {
        openPalette();
        selectTool('base64');
        expect(get(activeTool)).toBe('base64');
        expect(get(paletteVisible)).toBe(false);
    });
});
