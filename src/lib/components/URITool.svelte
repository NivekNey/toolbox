<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { encodeURI, decodeURI } from '$lib/utils/uri';

	let rawValue = '';
	let encodedValue = '';
	let errorMessage = '';
	let copyButtonTextRaw = 'Copy';
	let copyButtonTextEncoded = 'Copy';
	let isLoading = false;
	let processingTimeout: number | null = null;

	function syncRawToEncoded() {
		if (!rawValue) {
			encodedValue = '';
			errorMessage = '';
			return;
		}

		isLoading = true;
		if (processingTimeout) clearTimeout(processingTimeout);

		processingTimeout = window.setTimeout(() => {
			try {
				encodedValue = encodeURI(rawValue);
				errorMessage = '';
			} catch (error) {
				errorMessage = error instanceof Error ? error.message : 'Invalid input';
			} finally {
				isLoading = false;
			}
		}, 50);
	}

	function syncEncodedToRaw() {
		if (!encodedValue) {
			rawValue = '';
			errorMessage = '';
			return;
		}

		isLoading = true;
		if (processingTimeout) clearTimeout(processingTimeout);

		processingTimeout = window.setTimeout(() => {
			try {
				rawValue = decodeURI(encodedValue);
				errorMessage = '';
			} catch (error) {
				errorMessage = error instanceof Error ? error.message : 'Invalid encoded URI';
			} finally {
				isLoading = false;
			}
		}, 50);
	}

	function handleRawInput() {
		syncRawToEncoded();
	}

	function handleEncodedInput() {
		syncEncodedToRaw();
	}

	function clearAll() {
		rawValue = '';
		encodedValue = '';
		errorMessage = '';
	}

	async function copyToClipboard(text: string, type: 'raw' | 'encoded') {
		if (!text) return;

		try {
			await navigator.clipboard.writeText(text);
			if (type === 'raw') {
				copyButtonTextRaw = 'Copied!';
				setTimeout(() => copyButtonTextRaw = 'Copy', 1500);
			} else {
				copyButtonTextEncoded = 'Copied!';
				setTimeout(() => copyButtonTextEncoded = 'Copy', 1500);
			}
		} catch (error) {
			// Ignore silently
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

	onDestroy(() => {
		if (processingTimeout) clearTimeout(processingTimeout);
	});
</script>

<div class="card w-full" data-testid="uri-tool">
	<div class="card-header flex flex-row items-center justify-between">
		<div>
			<h3 class="card-title">URI Encoder/Decoder</h3>
			<p class="card-description">Encode and decode URL components with side-by-side sync</p>
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
				<div class="flex items-center justify-between">
					<label for="uri-raw" class="text-sm font-medium" data-testid="input-label">Raw Text</label>
					{#if rawValue}
						<button 
							class="btn btn-ghost btn-xs" 
							on:click={() => copyToClipboard(rawValue, 'raw')}
							data-testid="copy-button-raw"
						>
							{copyButtonTextRaw}
						</button>
					{/if}
				</div>
				<textarea
					id="uri-raw"
					class="textarea w-full min-h-[150px] font-mono"
					placeholder="Enter raw text..."
					bind:value={rawValue}
					on:keydown={handleKeydown}
					on:input={handleRawInput}
					aria-label="Raw Text"
					data-testid="input-textarea"
				></textarea>
			</div>

			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<label for="uri-encoded" class="text-sm font-medium" data-testid="output-label">Encoded URI</label>
					{#if encodedValue}
						<button 
							class="btn btn-ghost btn-xs" 
							on:click={() => copyToClipboard(encodedValue, 'encoded')}
							data-testid="copy-button-encoded"
						>
							{copyButtonTextEncoded}
						</button>
					{/if}
				</div>
				<div class="relative">
					<textarea
						id="uri-encoded"
						class="textarea w-full min-h-[150px] font-mono bg-muted/30"
						placeholder="Enter encoded URI..."
						bind:value={encodedValue}
						on:keydown={handleKeydown}
						on:input={handleEncodedInput}
						aria-label="Encoded URI"
						data-testid="output-textarea"
					></textarea>
					{#if isLoading}
						<div class="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-md" data-testid="loading-indicator">
							<span class="text-xs text-muted-foreground animate-pulse">Syncing...</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
		{#if errorMessage}
			<p class="text-xs text-destructive mt-1" data-testid="error-message">{errorMessage}</p>
		{/if}
	</div>
</div>
