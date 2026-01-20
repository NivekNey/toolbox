<script lang="ts">
	import { generateUUIDs } from '$lib/utils/uuid';
	import Editor from './Editor.svelte';

	let count = 1;
	let uppercase = false;
	let noHyphens = false;
	let uuids: string[] = [];
	let resultText = '';

	function handleGenerate() {
		uuids = generateUUIDs({ count, uppercase, noHyphens });
		resultText = uuids.join('\n');
	}

	function copyToClipboard() {
		if (!resultText) return;
		navigator.clipboard.writeText(resultText);
	}

	// Initial generation
	handleGenerate();
</script>

<div class="space-y-6">
	<div class="card p-6 bg-muted/5 border rounded-lg">
		<div class="flex flex-wrap items-end gap-6">
			<div class="space-y-2">
				<label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Count</label>
				<input 
					type="number" 
					bind:value={count} 
					min="1" 
					max="1000"
					class="w-24 h-10 px-3 bg-background border rounded-md focus:ring-2 focus:ring-primary outline-none"
				/>
			</div>

			<div class="flex items-center gap-6 h-10">
				<label class="flex items-center gap-2 cursor-pointer group">
					<input type="checkbox" bind:checked={uppercase} class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
					<span class="text-sm font-medium group-hover:text-primary transition-colors">Uppercase</span>
				</label>

				<label class="flex items-center gap-2 cursor-pointer group">
					<input type="checkbox" bind:checked={noHyphens} class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
					<span class="text-sm font-medium group-hover:text-primary transition-colors">No Hyphens</span>
				</label>
			</div>

			<div class="flex-1 flex justify-end gap-3">
				<button class="btn btn-secondary btn-sm px-6" on:click={copyToClipboard}>
					Copy All
				</button>
				<button class="btn btn-primary btn-sm px-8" on:click={handleGenerate}>
					Generate
				</button>
			</div>
		</div>
	</div>

	<Editor 
		label="Generated UUIDs"
		bind:value={resultText}
		readonly={true}
		dataTestId="uuid-output"
	/>
</div>
