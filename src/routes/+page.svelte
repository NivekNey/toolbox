<script lang="ts">
	import { onMount } from 'svelte';
	import { activeTool, openPalette } from '$lib/stores/palette';
	import Base64Tool from '$lib/components/Base64Tool.svelte';
	import URITool from '$lib/components/URITool.svelte';
	import TypographyTool from '$lib/components/TypographyTool.svelte';
	import DiffTool from '$lib/components/DiffTool.svelte';

	const tools = [
		{ id: 'base64', name: 'Base64', description: 'Real-time bidirectional conversion', component: Base64Tool },
		{ id: 'uri', name: 'URI Encoder', description: 'Real-time bidirectional sync', component: URITool },
		{ id: 'typography', name: 'Typography', description: 'Bidirectional Google Docs & Markdown', component: TypographyTool },
		{ id: 'diff', name: 'Text Diff', description: 'Side-by-side comparison', component: DiffTool }
	];

	onMount(() => {
		const updateFromHash = () => {
			const hash = window.location.hash.slice(1);
			if (hash && tools.some(t => t.id === hash)) {
				$activeTool = hash as any;
			} else if (hash === 'all') {
				$activeTool = 'all';
			}
		};

		window.addEventListener('hashchange', updateFromHash);
		updateFromHash();

		return () => window.removeEventListener('hashchange', updateFromHash);
	});

	$: {
		if (typeof window !== 'undefined') {
			const hash = $activeTool === 'all' ? 'all' : $activeTool;
			if (window.location.hash.slice(1) !== hash) {
				window.location.hash = hash;
			}
		}
	}
</script>

<div class="w-full min-h-screen flex flex-col">
	<header class="border-b px-6 py-3 flex items-center justify-between bg-background/50 backdrop-blur-sm sticky top-0 z-10">
		<div class="flex items-center gap-4">
			<button 
				class="text-lg font-bold tracking-tight hover:text-primary transition-colors"
				on:click={() => ($activeTool = 'all')}
			>
				Toolbox
			</button>
			
			{#if $activeTool !== 'all'}
				<nav class="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
					<span>/</span>
					<span class="font-medium text-foreground">{tools.find(t => t.id === $activeTool)?.name}</span>
				</nav>
			{/if}
		</div>
		
		<div class="flex items-center gap-6">
			<div class="hidden md:flex items-center gap-2 text-xs text-muted-foreground select-none">
				<span>Press <kbd class="px-1.5 py-0.5 rounded border bg-muted font-mono">⌘K</kbd> to search</span>
			</div>
			<button class="btn btn-ghost btn-sm text-muted-foreground hover:text-foreground" on:click={openPalette}>
				Palette
			</button>
		</div>
	</header>

	<main class="flex-1 w-full px-6 py-6">
		{#if $activeTool === 'all'}
			<div class="max-w-4xl mx-auto space-y-8 py-12">
				<div class="text-center space-y-2 mb-12">
					<h1 class="text-4xl font-bold">Developer's Toolbox</h1>
					<p class="text-muted-foreground">Minimalist, keyboard-first development tools</p>
				</div>
				
				<div class="grid sm:grid-cols-2 gap-4">
					{#each tools as tool}
						<button 
							class="card p-6 text-left hover:border-primary/50 transition-all hover:shadow-md group"
							on:click={() => ($activeTool = tool.id)}
						>
							<h3 class="text-lg font-semibold group-hover:text-primary transition-colors">{tool.name}</h3>
							<p class="text-sm text-muted-foreground mt-1">{tool.description}</p>
						</button>
					{/each}
				</div>
			</div>
		{:else}
			<div class="w-full">
				{#if $activeTool === 'base64'}
					<Base64Tool />
				{:else if $activeTool === 'uri'}
					<URITool />
				{:else if $activeTool === 'typography'}
					<TypographyTool />
				{:else if $activeTool === 'diff'}
					<DiffTool />
				{/if}
			</div>
		{/if}
	</main>
</div>
