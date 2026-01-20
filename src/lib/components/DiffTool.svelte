<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { computeDiff, type DiffPart } from '$lib/utils/diff';

	let oldText = '';
	let newText = '';
	let diffResult: DiffPart[] = [];
	let isLoading = false;
	let processingTimeout: number | null = null;

	function processDiff() {
		if (!oldText && !newText) {
			diffResult = [];
			return;
		}

		isLoading = true;
		
		if (processingTimeout) {
			clearTimeout(processingTimeout);
		}

		processingTimeout = window.setTimeout(() => {
			try {
				diffResult = computeDiff(oldText, newText);
			} catch (error) {
				console.error('Diff error:', error);
			} finally {
				isLoading = false;
			}
		}, 150);
	}

	function clearAll() {
		oldText = '';
		newText = '';
		diffResult = [];
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			clearAll();
		}
	}

	onMount(() => {
		const inputElement = document.querySelector('[data-testid="diff-old-textarea"]') as HTMLTextAreaElement;
		if (inputElement) {
			inputElement.focus();
		}
	});

	onDestroy(() => {
		if (processingTimeout) {
			clearTimeout(processingTimeout);
		}
	});

	$: if (oldText !== undefined || newText !== undefined) processDiff();
</script>

<div class="card w-full" data-testid="diff-tool">
	<div class="card-header flex flex-row items-center justify-between">
		<div>
			<h3 class="card-title">Text Diff Tool</h3>
			<p class="card-description">Compare two pieces of text side-by-side</p>
		</div>
		<button 
			class="btn btn-outline btn-sm" 
			on:click={clearAll}
			data-testid="clear-button"
		>
			Clear
		</button>
	</div>
	
	<div class="card-content space-y-4">
		<div class="grid md:grid-cols-2 gap-4">
			<div class="space-y-2">
				<label for="diff-old" class="text-sm font-medium" data-testid="input-label-old">Original Text</label>
				<textarea
					id="diff-old"
					class="textarea w-full min-h-[200px] font-mono text-sm"
					placeholder="Enter original text..."
					bind:value={oldText}
					on:keydown={handleKeydown}
					aria-label="Original Text"
					data-testid="input-old"
				></textarea>
			</div>

			<div class="space-y-2">
				<label for="diff-new" class="text-sm font-medium" data-testid="input-label-new">Modified Text</label>
				<textarea
					id="diff-new"
					class="textarea w-full min-h-[200px] font-mono text-sm"
					placeholder="Enter modified text..."
					bind:value={newText}
					on:keydown={handleKeydown}
					aria-label="Modified Text"
					data-testid="input-new"
				></textarea>
			</div>
		</div>

		<div class="space-y-2 mt-6">
			<h4 class="text-sm font-medium">Diff Result</h4>
			<div class="relative min-h-[200px] p-4 rounded-md border border-border bg-muted/30 font-mono text-sm whitespace-pre-wrap overflow-auto" data-testid="diff-container">
				{#if diffResult.length === 0}
					<span class="text-muted-foreground italic">No changes detected</span>
				{:else}
					{#each diffResult as part}
						{#if part.added}
							<span class="bg-success/20 text-success px-0.5 rounded" data-testid="diff-added">{part.value}</span>
						{:else if part.removed}
							<span class="bg-destructive/20 text-destructive px-0.5 rounded line-through" data-testid="diff-removed">{part.value}</span>
						{:else}
							<span>{part.value}</span>
						{/if}
					{/each}
				{/if}
				
				{#if isLoading}
					<div class="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-md">
						<span class="text-xs text-muted-foreground animate-pulse">Computing diff...</span>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
