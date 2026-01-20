<script lang="ts">
	import { formatSQL } from '$lib/utils/sqlFormatter';
	import Editor from './Editor.svelte';

	let sql = '';
	let formattedSql = '';
	let isSyncing = false;
	let syncTimeout: number;

	function handleInput(event: CustomEvent<string>) {
		sql = event.detail;
		isSyncing = true;
		clearTimeout(syncTimeout);
		syncTimeout = window.setTimeout(() => {
			formattedSql = formatSQL(sql);
			isSyncing = false;
		}, 300);
	}

	function copyToClipboard() {
		if (!formattedSql) return;
		navigator.clipboard.writeText(formattedSql);
	}
</script>

<div class="space-y-6">
	<div class="grid md:grid-cols-2 gap-6 items-start">
		<Editor 
			label="Input SQL"
			placeholder="Paste your messy SQL here..."
			bind:value={sql}
			on:input={handleInput}
			dataTestId="sql-input"
		/>

		<Editor 
			label="Formatted SQL"
			bind:value={formattedSql}
			readonly={true}
			dataTestId="sql-output"
		>
			<div slot="actions">
				<button 
					class="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline"
					on:click={copyToClipboard}
				>
					Copy Result
				</button>
			</div>
		</Editor>
	</div>

	{#if isSyncing}
		<div class="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
			<div class="w-1 h-1 rounded-full bg-primary"></div>
			Formatting...
		</div>
	{/if}
</div>
