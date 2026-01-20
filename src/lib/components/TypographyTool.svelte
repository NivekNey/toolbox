<script lang="ts">
	import { onDestroy } from 'svelte';
	import { googleToMarkdown, markdownToHtml } from '$lib/utils/typography';
	import Editor from './Editor.svelte';
	import RichEditor from './RichEditor.svelte';

	let richContent = '';
	let markdown = '';
	let isLoading = false;
	let processingTimeout: number | null = null;

	function syncRichToMarkdown(source: string) {
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

	function syncMarkdownToRich() {
		isLoading = true;
		if (processingTimeout) clearTimeout(processingTimeout);

		processingTimeout = window.setTimeout(() => {
			richContent = markdownToHtml(markdown);
			isLoading = false;
		}, 100);
	}

	function handleRichInput(event: CustomEvent<string>) {
		richContent = event.detail;
		syncRichToMarkdown(richContent);
	}

	function handleMarkdownInput(event: CustomEvent<string>) {
		markdown = event.detail;
		syncMarkdownToRich();
	}

	async function copyMarkdown() {
		if (!markdown) return;
		await navigator.clipboard.writeText(markdown);
	}

	async function copyRichText() {
		if (!richContent) return;
		try {
			const blob = new Blob([richContent], { type: 'text/html' });
			const item = new ClipboardItem({ 'text/html': blob });
			await navigator.clipboard.write([item]);
		} catch (error) {
			await navigator.clipboard.writeText(richContent.replace(/<[^>]*>/g, ''));
		}
	}

	function handlePaste(event: CustomEvent<ClipboardEvent> | ClipboardEvent) {
		const clipboardEvent = 'detail' in event ? event.detail : event;
		const html = clipboardEvent.clipboardData?.getData('text/html');
		const plain = clipboardEvent.clipboardData?.getData('text/plain');
		
		if (html && html.includes('<')) {
			clipboardEvent.preventDefault();
			const sanitizedHtml = html
				.replace(/color:[^;"]*;?/gi, '')
				.replace(/background-color:[^;"]*;?/gi, '');
			richContent = sanitizedHtml;
			syncRichToMarkdown(sanitizedHtml);
		} else if (plain) {
			// If it's just plain text, let the RichEditor handle it normally
			// or we can manually wrap it if we want to force a sync
		}
	}

	onDestroy(() => {
		if (processingTimeout) clearTimeout(processingTimeout);
	});
</script>

<div class="space-y-6">
	<div class="grid md:grid-cols-2 gap-6 items-start">
		<RichEditor 
			label="Rich Text / Google Docs"
			placeholder="Paste from Google Docs or type here..."
			bind:value={richContent}
			on:input={handleRichInput}
			on:paste={handlePaste}
			dataTestId="plain-editor"
		>
			<div slot="actions">
				<button class="btn btn-ghost btn-xs text-muted-foreground hover:text-foreground" on:click={copyRichText}>Copy as Rich Text</button>
			</div>
		</RichEditor>

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
		<div class="flex items-center gap-2 text-xs text-muted-foreground animate-pulse uppercase tracking-tight">
			<div class="w-2 h-2 rounded-full bg-primary"></div>
			Syncing...
		</div>
	{/if}
</div>
