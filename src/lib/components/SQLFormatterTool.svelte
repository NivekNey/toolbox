<script lang="ts">
	import { formatSQL, TokenType, type Token } from '$lib/utils/sqlFormatter';
	import Editor from './Editor.svelte';

	let sql = '';
	let formattedSql = '';
	let tokens: Token[] = [];
	let isSyncing = false;
	let syncTimeout: number;

	function handleInput(event: CustomEvent<string>) {
		sql = event.detail;
		isSyncing = true;
		clearTimeout(syncTimeout);
		syncTimeout = window.setTimeout(() => {
			const result = formatSQL(sql);
			formattedSql = result.text;
			tokens = result.tokens;
			isSyncing = false;
		}, 300);
	}

	function copyToClipboard() {
		if (!formattedSql) return;
		navigator.clipboard.writeText(formattedSql);
	}

	function getTokenClass(type: TokenType) {
		switch (type) {
			case TokenType.KEYWORD: return 'text-primary font-bold';
			case TokenType.STRING: return 'text-success';
			case TokenType.IDENTIFIER: return 'text-foreground';
			case TokenType.COMMENT: return 'text-muted-foreground italic';
			case TokenType.NUMBER: return 'text-amber-500';
			case TokenType.COMMA:
			case TokenType.PAREN_OPEN:
			case TokenType.PAREN_CLOSE: return 'text-muted-foreground';
			default: return 'text-foreground';
		}
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

		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Formatted SQL</label>
				<button 
					class="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline"
					on:click={copyToClipboard}
				>
					Copy Result
				</button>
			</div>
			
			<div 
				class="w-full min-h-[300px] p-4 bg-muted/5 border rounded-lg font-mono text-sm overflow-auto whitespace-pre leading-relaxed"
				data-testid="sql-output"
			>
				{#if tokens.length > 0}
					{#each tokens as token}
						<span class={getTokenClass(token.type)}>{token.value}</span>
					{/each}
				{:else if isSyncing}
					<span class="text-muted-foreground animate-pulse">Formatting...</span>
				{:else}
					<span class="text-muted-foreground italic">Result will appear here...</span>
				{/if}
			</div>
		</div>
	</div>

	{#if isSyncing}
		<div class="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
			<div class="w-1 h-1 rounded-full bg-primary"></div>
			Formatting...
		</div>
	{/if}
</div>
