<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { encodeURI, decodeURI } from '$lib/utils/uri';

	let mode: 'encode' | 'decode' = 'encode';
	let inputValue = '';
	let outputValue = '';
	let errorMessage = '';
	let copyButtonText = 'Copy';
	let inputLabel = 'URL Component / Plain Text';
	let outputLabel = 'Encoded URI';
	let isLoading = false;
	let processingTimeout: number | null = null;

	function processInput() {
		if (!inputValue) {
			outputValue = '';
			errorMessage = '';
			return;
		}

		isLoading = true;
		
		if (processingTimeout) {
			clearTimeout(processingTimeout);
		}

		processingTimeout = window.setTimeout(() => {
			try {
				if (mode === 'encode') {
					outputValue = encodeURI(inputValue);
				} else {
					outputValue = decodeURI(inputValue);
				}
				errorMessage = '';
			} catch (error) {
				outputValue = '';
				errorMessage = error instanceof Error ? error.message : 'Invalid input';
			} finally {
				isLoading = false;
			}
		}, 50);
	}

	function toggleMode() {
		mode = mode === 'encode' ? 'decode' : 'encode';
		// Swap content when switching
		const temp = inputValue;
		inputValue = outputValue;
		outputValue = temp;
		
		updateLabels();
		errorMessage = '';
	}

	function updateLabels() {
		if (mode === 'encode') {
			inputLabel = 'URL Component / Plain Text';
			outputLabel = 'Encoded URI';
		} else {
			inputLabel = 'Encoded URI';
			outputLabel = 'Decoded Text';
		}
	}

	function clearAll() {
		inputValue = '';
		outputValue = '';
		errorMessage = '';
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
		const inputElement = document.querySelector('[data-testid="uri-input-textarea"]') as HTMLTextAreaElement;
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

<div class="card w-full" data-testid="uri-tool">
	<div class="card-header flex flex-row items-center justify-between">
		<div>
			<h3 class="card-title">URI Encoder/Decoder</h3>
			<p class="card-description">Encode and decode URL components safely</p>
		</div>
		<div class="flex items-center gap-2">
			<button 
				class="btn btn-secondary btn-sm" 
				on:click={toggleMode}
				data-testid="mode-toggle"
			>
				Switch to {mode === 'encode' ? 'Decode' : 'Encode'}
			</button>
			<button 
				class="btn btn-outline btn-sm" 
				on:click={clearAll}
				data-testid="clear-button"
			>
				Clear
			</button>
		</div>
	</div>
	
	<div class="card-content space-y-4">
		<div class="space-y-2">
			<label for="uri-input" class="text-sm font-medium" data-testid="input-label">{inputLabel}</label>
			<textarea
				id="uri-input"
				class="textarea w-full min-h-[120px] font-mono"
				placeholder="Enter text to {mode}..."
				bind:value={inputValue}
				on:keydown={handleKeydown}
				aria-label={inputLabel}
				data-testid="input-textarea"
			></textarea>
		</div>

		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<label for="uri-output" class="text-sm font-medium" data-testid="output-label">{outputLabel}</label>
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
			<div class="relative">
				<textarea
					id="uri-output"
					class="textarea w-full min-h-[120px] font-mono bg-muted/50"
					readonly
					value={outputValue}
					placeholder="Output will appear here..."
					aria-label={outputLabel}
					data-testid="output-textarea"
				></textarea>
				{#if isLoading}
					<div class="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-md" data-testid="loading-indicator">
						<span class="text-xs text-muted-foreground animate-pulse">Processing...</span>
					</div>
				{/if}
			</div>
			{#if errorMessage}
				<p class="text-xs text-destructive mt-1" data-testid="error-message">{errorMessage}</p>
			{/if}
		</div>
	</div>
</div>
