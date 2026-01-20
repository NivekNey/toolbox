<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { googleToMarkdown, markdownToHtml } from '$lib/utils/typography';

	let plainText = '';
	let markdown = '';
	let copyButtonTextMarkdown = 'Copy Markdown';
	let copyButtonTextRichText = 'Copy as Rich Text';
	let isLoading = false;
	let processingTimeout: number | null = null;

	function syncPlainToMarkdown(source: string) {
		isLoading = true;
		if (processingTimeout) clearTimeout(processingTimeout);

		processingTimeout = window.setTimeout(() => {
			try {
				markdown = googleToMarkdown(source);
			} catch (error) {
				// Silent error
			} finally {
				isLoading = false;
			}
		}, 100);
	}

	function syncMarkdownToPlain() {
		isLoading = true;
		if (processingTimeout) clearTimeout(processingTimeout);

		processingTimeout = window.setTimeout(() => {
			// Markdown here is treated as the source of truth for the Plain side
			// We don't actually show HTML on the left, but we keep text in sync
			plainText = markdown;
			isLoading = false;
		}, 100);
	}

	function handlePlainInput() {
		syncPlainToMarkdown(plainText);
	}

	function handleMarkdownInput() {
		syncMarkdownToPlain();
	}

	function clearAll() {
		plainText = '';
		markdown = '';
	}

	async function copyMarkdown() {
		if (!markdown) return;
		try {
			await navigator.clipboard.writeText(markdown);
			copyButtonTextMarkdown = 'Copied!';
			setTimeout(() => copyButtonTextMarkdown = 'Copy Markdown', 1500);
		} catch (error) {
			// Silent error
		}
	}

	async function copyRichText() {
		if (!markdown) return;
		try {
			const htmlContent = markdownToHtml(markdown);
			const blob = new Blob([htmlContent], { type: 'text/html' });
			const item = new ClipboardItem({ 'text/html': blob });
			await navigator.clipboard.write([item]);
			
			copyButtonTextRichText = 'Copied Rich Text!';
			setTimeout(() => copyButtonTextRichText = 'Copy as Rich Text', 1500);
		} catch (error) {
			console.error('Rich text copy failed:', error);
			// Fallback to plain text if rich text fails
			await navigator.clipboard.writeText(plainText);
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

	function handlePaste(event: ClipboardEvent) {
		const html = event.clipboardData?.getData('text/html');
		const plain = event.clipboardData?.getData('text/plain');
		
		if (html && html.includes('<')) {
			event.preventDefault();
			plainText = plain || '';
			// We sync from HTML source for high fidelity
			syncPlainToMarkdown(html);
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
				<div class="flex items-center justify-between">
					<label for="typo-plain" class="text-sm font-medium" data-testid="input-label">Plain Text / Google Docs</label>
					{#if plainText}
						<button 
							class="btn btn-ghost btn-xs" 
							on:click={copyRichText}
							data-testid="copy-rich-button"
						>
							{copyButtonTextRichText}
						</button>
					{/if}
				</div>
				<textarea
					id="typo-plain"
					class="textarea w-full min-h-[400px] font-sans"
					placeholder="Paste from Google Docs or type here..."
					bind:value={plainText}
					on:keydown={handleKeydown}
					on:paste={handlePaste}
					on:input={handlePlainInput}
					aria-label="Plain Text / Google Docs"
					data-testid="input-textarea"
				></textarea>
			</div>

			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<label for="typo-markdown" class="text-sm font-medium" data-testid="output-label">Markdown</label>
					{#if markdown}
						<button 
							class="btn btn-ghost btn-xs" 
							on:click={copyMarkdown}
							data-testid="copy-markdown-button"
						>
							{copyButtonTextMarkdown}
						</button>
					{/if}
				</div>
				<div class="relative h-full">
					<textarea
						id="typo-markdown"
						class="textarea w-full h-[calc(100%-1.5rem)] min-h-[400px] font-mono bg-muted/30"
						bind:value={markdown}
						on:keydown={handleKeydown}
						on:input={handleMarkdownInput}
						placeholder="Markdown will appear here..."
						aria-label="Markdown"
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
	</div>
</div>
