<script lang="ts">
	import { computeDiff } from '$lib/utils/diff';
	import Editor from './Editor.svelte';

	let text1 = '';
	let text2 = '';

	$: diffResult = computeDiff(text1, text2);
</script>

<div class="space-y-6">
	<div class="grid md:grid-cols-2 gap-6 items-start">
		<Editor 
			label="Original Text"
			placeholder="Enter original text..."
			bind:value={text1}
			dataTestId="diff-text1"
		/>

		<Editor 
			label="Changed Text"
			placeholder="Enter changed text..."
			bind:value={text2}
			dataTestId="diff-text2"
		/>
	</div>

	{#if text1 || text2}
		<div class="editor-container" data-testid="diff-result">
			<label class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Visual Diff</label>
			<div class="editor-wrapper p-6 bg-muted/5 border rounded-md font-mono text-sm leading-6 whitespace-pre min-h-[200px] overflow-auto">
				{#each diffResult as part}
					<span 
						class={part.added ? 'bg-success/20 text-success line-through-none' : part.removed ? 'bg-destructive/20 text-destructive line-through' : ''}
						data-testid={part.added ? 'diff-added' : part.removed ? 'diff-removed' : 'diff-unchanged'}
					>{part.value}</span>
				{/each}
				{#if diffResult.length === 0 && (text1 || text2)}
					<span class="text-muted-foreground italic">No changes detected</span>
				{/if}
			</div>
		</div>
	{/if}
</div>
