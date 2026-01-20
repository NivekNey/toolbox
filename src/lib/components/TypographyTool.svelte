<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { googleToMarkdown } from '$lib/utils/typography';

	let inputValue = '';
	let outputValue = '';
	let copyButtonText = 'Copy';
	let isLoading = false;
	let processingTimeout: number | null = null;

	function processInput() {
		if (!inputValue) {
			outputValue = '';
			return;
		}

		isLoading = true;
		
		if (processingTimeout) {
			clearTimeout(processingTimeout);
		}

		processingTimeout = window.setTimeout(() => {
			try {
				outputValue = googleToMarkdown(inputValue);
			} catch (error) {
				outputValue = 'Error: Failed to convert text';
			} finally {
				isLoading = false;
			}
		}, 100);
	}

	function clearAll() {
		inputValue = '';
		outputValue = '';
	}

	async function copyToClipboard() {
		if (!outputValue) return;

		try {
			await navigator.clipboard.writeText(outputValue);
			copyButtonText = 'Copied!';
			setTimeout(() => {
				copyButtonText = 'Copy';
			}, 1500);
		} catch (error) {
			copyButtonText = 'Failed';
			setTimeout(() => {
				copyButtonText = 'Copy';
			}, 1500);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
			event.preventDefault();
			const textarea = event.target as HTMLTextAreaElement;
			textarea.select();
		}

		if (event.key === 'Escape') {
			event.preventDefault();
			clearAll();
		}
	}

	onMount(() => {
		const inputElement = document.querySelector('[data-testid="typo-input-textarea"]') as HTMLTextAreaElement;
		if (inputElement) {
			inputElement.focus();
		}
	});

	onDestroy(() => {
		if (processingTimeout) {
			clearTimeout(processingTimeout);
		}
	});

	$: if (inputValue || inputValue === '') processInput();
</script>

<div class="card w-full" data-testid="typography-tool">
	<div class="card-header flex flex-row items-center justify-between">
		<div>
			<h3 class="card-title">Typography Converter</h3>
			<p class="card-description">Convert Google Docs formatting to Markdown</p>
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
				<label for="typo-input" class="text-sm font-medium" data-testid="input-label">Input (Paste from Google Docs)</label>
				<textarea
					id="typo-input"
					class="textarea w-full min-h-[300px] font-sans"
					placeholder="Paste your text here..."
					bind:value={inputValue}
					on:keydown={handleKeydown}
					aria-label="Input (Paste from Google Docs)"
					data-testid="input-textarea"
				></textarea>
			</div>

			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<label for="typo-output" class="text-sm font-medium" data-testid="output-label">Markdown Output</label>
					{#if outputValue}
						<button 
							class="btn btn-ghost btn-xs" 
							on:click={copyToClipboard}
							data-testid="copy-button"
						>
							{copyButtonText}
						</button>
					{/if}
				</div>
				<div class="relative h-full">
					<textarea
						id="typo-output"
						class="textarea w-full h-[calc(100%-1.5rem)] min-h-[300px] font-mono bg-muted/50"
						readonly
						value={outputValue}
						placeholder="Markdown will appear here..."
						aria-label="Markdown Output"
						data-testid="output-textarea"
					></textarea>
					{#if isLoading}
						<div class="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-md" data-testid="loading-indicator">
							<span class="text-xs text-muted-foreground animate-pulse">Converting...</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
