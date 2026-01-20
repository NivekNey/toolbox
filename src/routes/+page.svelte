<script lang="ts">
	import { onMount } from 'svelte';
	import { activeTool, openPalette } from '$lib/stores/palette';
	import Base64Tool from '$lib/components/Base64Tool.svelte';
	import URITool from '$lib/components/URITool.svelte';
	import TypographyTool from '$lib/components/TypographyTool.svelte';
	import DiffTool from '$lib/components/DiffTool.svelte';
	import UUIDTool from '$lib/components/UUIDTool.svelte';
	import TimestampTool from '$lib/components/TimestampTool.svelte';
	import SQLFormatterTool from '$lib/components/SQLFormatterTool.svelte';
	import TimezoneTool from '$lib/components/TimezoneTool.svelte';

	const tools = [
		{ id: 'base64', name: 'Base64', description: 'Real-time bidirectional conversion', component: Base64Tool },
		{ id: 'uri', name: 'URI Encoder', description: 'Real-time bidirectional sync', component: URITool },
		{ id: 'typography', name: 'Typography', description: 'Bidirectional Google Docs & Markdown', component: TypographyTool },
		{ id: 'diff', name: 'Text Diff', description: 'Side-by-side comparison', component: DiffTool },
		{ id: 'uuid', name: 'UUID Gen', description: 'Bulk secure UUID v4 generation', component: UUIDTool },
		{ id: 'timestamp', name: 'Unix Time', description: 'Live epoch clock and conversion', component: TimestampTool },
		{ id: 'sql', name: 'SQL Formatter', description: 'AST-based structural formatting', component: SQLFormatterTool },
		{ id: 'timezone', name: 'Timezones', description: 'Visual 48h alignment axis', component: TimezoneTool }
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
			<div class="hidden md:flex items-center gap-4 text-xs select-none">
				<div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success border border-success/30 font-bold uppercase tracking-tight">
					<div class="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
					Secure & Local
				</div>
				<span class="text-muted-foreground">Press <kbd class="px-1.5 py-0.5 rounded border bg-muted font-mono">⌘K</kbd> to search</span>
			</div>
			
			<div class="flex items-center gap-4 border-l pl-4">
				<a 
					href="https://github.com/NivekNey/toolbox" 
					target="_blank" 
					rel="noopener noreferrer"
					class="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
				>
					GitHub
				</a>
				<button class="btn btn-ghost btn-sm text-muted-foreground hover:text-foreground" on:click={openPalette}>
					Palette
				</button>
			</div>
		</div>
	</header>

	<main class="flex-1 w-full px-6 py-6">
		{#if $activeTool === 'all'}
			<div class="max-w-6xl mx-auto space-y-12 py-16">
				<div class="text-center space-y-4 mb-16">
					<h1 class="text-5xl font-extrabold tracking-tight">Developer's Toolbox</h1>
					<p class="text-xl text-muted-foreground max-w-2xl mx-auto">
						Professional, secure, local-first utilities.
					</p>
					<div class="flex items-center justify-center gap-8 pt-6">
						<div class="flex flex-col items-center gap-1">
							<div class="flex items-center gap-1.5 text-success">
								<span class="text-xs font-bold uppercase tracking-widest">End-to-End Privacy</span>
							</div>
							<p class="text-[10px] text-muted-foreground">Data processing happens entirely on your machine.</p>
						</div>
						<div class="w-px h-10 bg-border"></div>
						<div class="flex flex-col items-center gap-1">
							<span class="text-xs font-bold uppercase tracking-widest text-primary">No External Calls</span>
							<p class="text-[10px] text-muted-foreground">Zero cloud, zero tracking, zero risk.</p>
						</div>
						<div class="w-px h-10 bg-border"></div>
						<div class="flex flex-col items-center gap-1">
							<span class="text-xs font-bold uppercase tracking-widest text-primary">Open Source</span>
							<p class="text-[10px] text-muted-foreground">Audit the code on GitHub.</p>
						</div>
					</div>
				</div>
				
				<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{#each tools as tool}
						<button 
							class="card p-5 text-left hover:border-primary/50 transition-all hover:shadow-lg group relative overflow-hidden h-32"
							on:click={() => ($activeTool = tool.id)}
						>
							<div class="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
								<span class="text-[10px] font-mono tracking-tighter">{tool.id.toUpperCase()}</span>
							</div>
							<h3 class="text-base font-bold group-hover:text-primary transition-colors">{tool.name}</h3>
							<p class="text-xs text-muted-foreground mt-2 leading-relaxed">{tool.description}</p>
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
				{:else if $activeTool === 'uuid'}
					<UUIDTool />
				{:else if $activeTool === 'timestamp'}
					<TimestampTool />
				{:else if $activeTool === 'sql'}
					<SQLFormatterTool />
				{:else if $activeTool === 'timezone'}
					<TimezoneTool />
				{/if}
			</div>
		{/if}
	</main>
</div>
