<script lang="ts">
	import { activeTool, openPalette } from '$lib/stores/palette';
	import Base64Tool from '$lib/components/Base64Tool.svelte';
	import URITool from '$lib/components/URITool.svelte';
	import TypographyTool from '$lib/components/TypographyTool.svelte';
	import DiffTool from '$lib/components/DiffTool.svelte';

	const tools = [
		{ id: 'base64', name: 'Base64', description: 'Real-time bidirectional conversion', component: Base64Tool },
		{ id: 'uri', name: 'URI Encoder', description: 'Safe URL component encoding', component: URITool },
		{ id: 'typography', name: 'Typography', description: 'Google Docs to Markdown', component: TypographyTool },
		{ id: 'diff', name: 'Text Diff', description: 'Side-by-side comparison', component: DiffTool }
	];
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<header class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
		<div>
			<h1 class="text-4xl font-bold tracking-tight mb-2">Developer's Toolbox</h1>
			<p class="text-muted-foreground text-lg">Minimalist, keyboard-first development tools</p>
		</div>
		
		<div class="flex items-center gap-4 text-sm text-muted-foreground bg-muted/30 px-4 py-2 rounded-lg border border-border">
			<span>Press <kbd class="px-2 py-1 text-xs font-mono bg-background border border-border rounded shadow-sm">⌘K</kbd> to switch tools</span>
			<button class="btn btn-primary btn-xs" on:click={openPalette}>Open Palette</button>
		</div>
	</header>

	<main class="grid gap-8">
		{#if $activeTool === 'all'}
			<div class="grid md:grid-cols-2 gap-6">
				{#each tools as tool}
					<button 
						class="card text-left hover:border-primary/50 transition-colors group"
						on:click={() => ($activeTool = tool.id)}
					>
						<div class="card-header">
							<h3 class="card-title group-hover:text-primary transition-colors">{tool.name}</h3>
							<p class="card-description">{tool.description}</p>
						</div>
						<div class="card-content">
							<div class="h-1 bg-muted rounded-full overflow-hidden">
								<div class="h-full bg-primary/20 w-1/3 group-hover:w-full transition-all duration-500"></div>
							</div>
						</div>
					</button>
				{/each}
			</div>
		{:else}
			<div class="flex items-center gap-2 mb-2">
				<button 
					class="btn btn-ghost btn-sm px-0 hover:bg-transparent" 
					on:click={() => ($activeTool = 'all')}
				>
					← Back to Dashboard
				</button>
				<span class="text-muted-foreground">/</span>
				<span class="font-medium">{tools.find(t => t.id === $activeTool)?.name}</span>
			</div>

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
