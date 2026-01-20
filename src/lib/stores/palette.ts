import { writable } from 'svelte/store';

export type ToolId = 'base64' | 'uri' | 'typography' | 'diff' | 'all';

export const paletteVisible = writable(false);
export const activeTool = writable<ToolId>('all');

export function togglePalette() {
    paletteVisible.update(v => !v);
}

export function closePalette() {
    paletteVisible.set(false);
}

export function openPalette() {
    paletteVisible.set(true);
}

export function selectTool(tool: ToolId) {
    activeTool.set(tool);
    closePalette();
}
