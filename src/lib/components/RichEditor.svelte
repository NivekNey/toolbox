<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';

	export let value = ''; // This will be HTML
	export let placeholder = '';
	export let label = '';
	export let dataTestId = 'rich-editor';

	const dispatch = createEventDispatcher();
	let editor: HTMLDivElement;

	function handleInput() {
		value = editor.innerHTML;
		dispatch('input', value);
	}

	function handlePaste(e: ClipboardEvent) {
		// Forward the raw paste event so the parent can handle Google Docs specifics
		dispatch('paste', e);
	}

	$: if (editor && editor.innerHTML !== value) {
		editor.innerHTML = value;
	}
</script>

<div class="rich-editor-container group" data-testid={dataTestId}>
	{#if label}
		<div class="flex items-center justify-between mb-1">
			<label class="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
			<slot name="actions" />
		</div>
	{/if}
	
	<div class="editor-wrapper relative border rounded-md overflow-hidden bg-muted/5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background transition-all">
		<div
			bind:this={editor}
			contenteditable="true"
			class="w-full min-h-[400px] py-6 px-12 font-serif text-lg leading-relaxed focus:outline-none text-foreground bg-transparent max-w-none"
			on:input={handleInput}
			on:paste={handlePaste}
			data-testid={`${dataTestId}-editable`}
			aria-label={label}
			spellcheck="false"
			autocorrect="off"
			autocapitalize="off"
			autocomplete="off"
		></div>
		
		{#if !value}
			<div class="absolute top-6 left-12 text-muted-foreground/40 pointer-events-none select-none font-serif text-lg">
				{placeholder}
			</div>
		{/if}
	</div>
</div>

<style>
	.editor-wrapper {
		min-height: 400px;
	}

	/* Minimal prose-like styles if Tailwind Typography isn't available */
	:global([contenteditable]), :global([contenteditable] *) {
		outline: none;
		color: inherit !important;
		background-color: transparent !important;
	}

	[contenteditable] :global(b), [contenteditable] :global(strong) {
		font-weight: 700;
	}

	[contenteditable] :global(i), [contenteditable] :global(em) {
		font-style: italic;
	}

	[contenteditable] :global(h1) {
		font-size: 2em;
		font-weight: 800;
		margin-bottom: 0.5em;
	}

	[contenteditable] :global(h2) {
		font-size: 1.5em;
		font-weight: 700;
		margin-bottom: 0.5em;
	}

	[contenteditable] :global(ul) {
		list-style-type: disc;
		padding-left: 1.5em;
		margin-bottom: 1em;
	}

	[contenteditable] :global(ol) {
		list-style-type: decimal;
		padding-left: 1.5em;
		margin-bottom: 1em;
	}
</style>
