<script lang="ts">
	import { onMount } from 'svelte';
	import { paletteVisible, closePalette, selectTool, type ToolId } from '$lib/stores/palette';
	import { fly, fade } from 'svelte/transition';

	const tools: { id: ToolId; name: string; description: string; shortcut: string }[] = [
		{ id: 'all', name: 'Show All Tools', description: 'Overview of all available utilities', shortcut: 'A' },
		{ id: 'base64', name: 'Base64 Encoder/Decoder', description: 'Real-time bidirectional conversion', shortcut: 'B' },
		{ id: 'uri', name: 'URI Encoder/Decoder', description: 'Safe URL component encoding', shortcut: 'U' },
		{ id: 'typography', name: 'Typography Converter', description: 'Google Docs to Markdown', shortcut: 'T' },
		{ id: 'diff', name: 'Text Diff Tool', description: 'Side-by-side comparison', shortcut: 'D' }
	];

	let search = '';
	let selectedIndex = 0;

	$: filteredTools = tools.filter(tool => 
		tool.name.toLowerCase().includes(search.toLowerCase()) || 
		tool.description.toLowerCase().includes(search.toLowerCase())
	);

	$: {
		if (selectedIndex >= filteredTools.length) {
			selectedIndex = Math.max(0, filteredTools.length - 1);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closePalette();
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			selectedIndex = (selectedIndex + 1) % filteredTools.length;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			selectedIndex = (selectedIndex - 1 + filteredTools.length) % filteredTools.length;
		} else if (event.key === 'Enter') {
			event.preventDefault();
			if (filteredTools[selectedIndex]) {
				const id = filteredTools[selectedIndex].id;
				search = '';
				selectTool(id);
			}
		}
	}

	function handleSelection(id: ToolId) {
		search = '';
		selectTool(id);
	}

	function handleCommandK(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
			event.preventDefault();
			paletteVisible.update(v => !v);
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleCommandK);
		return () => window.removeEventListener('keydown', handleCommandK);
	});
</script>

{#if $paletteVisible}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div 
		class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-background/80 backdrop-blur-sm"
		on:click={closePalette}
		transition:fade={{ duration: 150 }}
	>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div 
			class="w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
			on:click|stopPropagation
			transition:fly={{ y: -20, duration: 200 }}
			role="dialog"
			aria-modal="true"
		>
			<div class="p-4 border-b border-border">
				<input
					bind:value={search}
					on:keydown={handleKeydown}
					type="text"
					class="w-full bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground"
					placeholder="Search tools... (↑/↓ to navigate, Enter to select)"
					autofocus
					data-testid="palette-search"
				/>
			</div>

			<div class="max-h-[60vh] overflow-y-auto p-2">
				{#each filteredTools as tool, i}
					<button
						class="w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors {i === selectedIndex ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}"
						on:click={() => handleSelection(tool.id)}
						on:mouseenter={() => selectedIndex = i}
						data-testid="palette-item-{tool.id}"
					>
						<div>
							<div class="font-medium {i === selectedIndex ? 'text-primary' : 'text-foreground'}">{tool.name}</div>
							<div class="text-xs opacity-70">{tool.description}</div>
						</div>
						<div class="text-[10px] font-mono border border-border px-1.5 py-0.5 rounded bg-muted">
							{tool.shortcut}
						</div>
					</button>
				{/each}
				
				{#if filteredTools.length === 0}
					<div class="p-4 text-center text-muted-foreground italic">
						No tools found matching "{search}"
					</div>
				{/if}
			</div>

			<div class="p-3 bg-muted/30 border-t border-border flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
				<span>Navigate: ↑ ↓</span>
				<span>Select: Enter</span>
				<span>Close: Esc</span>
			</div>
		</div>
	</div>
{/if}
