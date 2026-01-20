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
		<div class="diff-container border rounded-lg overflow-hidden bg-background shadow-sm" data-testid="diff-result">
			<div class="bg-muted/30 px-4 py-2 border-b flex items-center justify-between">
				<span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unified Diff</span>
				<div class="flex gap-4 text-[10px] text-muted-foreground font-medium">
					<div class="flex items-center gap-1">
						<div class="w-2 h-2 rounded bg-destructive/20 border border-destructive/30"></div>
						Removed
					</div>
					<div class="flex items-center gap-1">
						<div class="w-2 h-2 rounded bg-success/20 border border-success/30"></div>
						Added
					</div>
				</div>
			</div>
			
			<div class="overflow-x-auto">
				<table class="w-full border-collapse font-mono text-sm leading-6">
					<tbody>
						{#each diffResult as line}
							<tr class="group hover:bg-muted/50 transition-colors {line.type === 'added' ? 'bg-success/5' : line.type === 'removed' ? 'bg-destructive/5' : ''}">
								<td class="w-12 px-2 text-right select-none text-muted-foreground/30 border-r border-muted/20 bg-muted/5 text-[10px]">
									{line.oldLineNumber || ''}
								</td>
								<td class="w-12 px-2 text-right select-none text-muted-foreground/30 border-r border-muted/20 bg-muted/5 text-[10px]">
									{line.newLineNumber || ''}
								</td>
								<td class="w-6 px-2 text-center select-none font-bold {line.type === 'added' ? 'text-success' : line.type === 'removed' ? 'text-destructive' : 'text-muted-foreground/20'}">
									{line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
								</td>
								<td class="px-4 whitespace-pre {line.type === 'added' ? 'text-success-foreground' : line.type === 'removed' ? 'text-destructive-foreground' : 'text-foreground'}">
									{#if typeof line.content === 'string'}
										<span data-testid={line.type === 'added' ? 'diff-added' : line.type === 'removed' ? 'diff-removed' : undefined}>
											{line.content}
										</span>
									{:else}
										{#each line.content as part}
											<span 
												class={part.added ? 'bg-success/30 text-success-foreground font-bold' : part.removed ? 'bg-destructive/30 text-destructive-foreground font-bold' : ''}
												data-testid={part.added ? 'diff-added' : part.removed ? 'diff-removed' : undefined}
											>
												{part.value}
											</span>
										{/each}
									{/if}
								</td>
							</tr>
						{/each}
						{#if diffResult.length === 0 && (text1 || text2)}
							<tr>
								<td colspan="4" class="p-8 text-center text-muted-foreground italic">
									No changes detected. Both texts are identical.
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<style>
	.diff-container {
		font-variant-ligatures: none;
	}

	tr:hover td {
		background-color: transparent !important;
	}
</style>
