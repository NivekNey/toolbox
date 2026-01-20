<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';

	export let value = '';
	export let placeholder = '';
	export let label = '';
	export let readonly = false;
	export let dataTestId = 'editor';
	export let ariaLabel = '';

	const dispatch = createEventDispatcher();
	let textarea: HTMLTextAreaElement;
	let lineNumbersDiv: HTMLDivElement;
	let lineCount = 1;

	$: {
		lineCount = value.split('\n').length || 1;
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		value = target.value;
		dispatch('input', value);
		syncScroll();
	}

	function syncScroll() {
		if (lineNumbersDiv && textarea) {
			lineNumbersDiv.scrollTop = textarea.scrollTop;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
			event.preventDefault();
			textarea.select();
		}
		dispatch('keydown', event);
	}

	onMount(() => {
		syncScroll();
	});
</script>

<div class="editor-container group" data-testid={dataTestId}>
	{#if label}
		<div class="flex items-center justify-between mb-1">
			<label class="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
			<slot name="actions" />
		</div>
	{/if}
	
	<div class="editor-wrapper relative flex border rounded-md overflow-hidden bg-muted/5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background transition-all">
		<div 
			bind:this={lineNumbersDiv}
			class="line-numbers text-right py-3 px-3 min-w-[3rem] bg-muted/20 text-muted-foreground/40 font-mono text-sm select-none border-r overflow-hidden"
			aria-hidden="true"
		>
			{#each Array(lineCount) as _, i}
				<div class="leading-6">{i + 1}</div>
			{/each}
		</div>
		
		<div class="flex-1 relative">
			<textarea
				bind:this={textarea}
				class="w-full h-full min-h-[400px] border-none bg-transparent py-3 px-4 font-mono text-sm leading-6 resize-none focus:outline-none"
				{value}
				{placeholder}
				{readonly}
				on:input={handleInput}
				on:scroll={syncScroll}
				on:keydown={handleKeydown}
				aria-label={ariaLabel || label}
				data-testid={`${dataTestId}-textarea`}
			></textarea>
		</div>
	</div>
</div>

<style>
	.editor-wrapper {
		min-height: 400px;
	}
	
	.line-numbers {
		scrollbar-width: none;
	}
	
	.line-numbers::-webkit-scrollbar {
		display: none;
	}

	textarea {
		tab-size: 4;
		white-space: pre;
	}
</style>
