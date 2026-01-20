<script lang="ts">
	import { onDestroy } from 'svelte';
	import { googleToMarkdown, markdownToHtml } from '$lib/utils/typography';
	import Editor from './Editor.svelte';

	let plainText = '';
	let markdown = '';
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

	async function copyMarkdown() {
		if (!markdown) return;
		await navigator.clipboard.writeText(markdown);
	}

	async function copyRichText() {
		if (!markdown) return;
		try {
			const htmlContent = markdownToHtml(markdown);
			const blob = new Blob([htmlContent], { type: 'text/html' });
			const item = new ClipboardItem({ 'text/html': blob });
			await navigator.clipboard.write([item]);
		} catch (error) {
			await navigator.clipboard.writeText(plainText);
		}
	}

	function handlePaste(event: ClipboardEvent) {
		const html = event.clipboardData?.getData('text/html');
		const plain = event.clipboardData?.getData('text/plain');
		
		if (html && html.includes('<')) {
			event.preventDefault();
			plainText = plain || '';
			syncPlainToMarkdown(html);
		}
	}

	onDestroy(() => {
		if (processingTimeout) clearTimeout(processingTimeout);
	});
</script>

<div class="space-y-6">
	<div class="grid md:grid-cols-2 gap-6 items-start">
		<Editor 
			label="Plain Text / Google Docs"
			placeholder="Paste from Google Docs or type here..."
			bind:value={plainText}
			on:input={handlePlainInput}
			on:paste={handlePaste}
			dataTestId="plain-editor"
		>
			<div slot="actions">
				<button class="btn btn-ghost btn-xs text-muted-foreground hover:text-foreground" on:click={copyRichText}>Copy as Rich Text</button>
			</div>
		</Editor>

		<Editor 
			label="Markdown"
			placeholder="Markdown will appear here..."
			bind:value={markdown}
			on:input={handleMarkdownInput}
			dataTestId="markdown-editor"
		>
			<div slot="actions">
				<button class="btn btn-ghost btn-xs text-muted-foreground hover:text-foreground" on:click={copyMarkdown}>Copy Markdown</button>
			</div>
		</Editor>
	</div>

	{#if isLoading}
		<p class="text-xs text-muted-foreground animate-pulse uppercase tracking-tight">Syncing...</p>
	{/if}
</div>
