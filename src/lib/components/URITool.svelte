<script lang="ts">
	import { onDestroy } from 'svelte';
	import Editor from './Editor.svelte';

	let rawValue = '';
	let encodedValue = '';
	let errorMessage = '';
	let isLoading = false;
	let processingTimeout: number | null = null;

	function syncRawToEncoded() {
		if (!rawValue) {
			encodedValue = '';
			errorMessage = '';
			return;
		}

		isLoading = true;
		if (processingTimeout) clearTimeout(processingTimeout);

		processingTimeout = window.setTimeout(() => {
			try {
				encodedValue = encodeURI(rawValue);
				errorMessage = '';
			} catch (error) {
				errorMessage = error instanceof Error ? error.message : 'Invalid input';
			} finally {
				isLoading = false;
			}
		}, 50);
	}

	function syncEncodedToRaw() {
		if (!encodedValue) {
			rawValue = '';
			errorMessage = '';
			return;
		}

		isLoading = true;
		if (processingTimeout) clearTimeout(processingTimeout);

		processingTimeout = window.setTimeout(() => {
			try {
				rawValue = decodeURI(encodedValue);
				errorMessage = '';
			} catch (error) {
				errorMessage = error instanceof Error ? error.message : 'Invalid encoded URI';
			} finally {
				isLoading = false;
			}
		}, 50);
	}

	function handleRawInput() {
		syncRawToEncoded();
	}

	function handleEncodedInput() {
		syncEncodedToRaw();
	}

	async function copyToClipboard(text: string) {
		if (!text) return;
		await navigator.clipboard.writeText(text);
	}

	onDestroy(() => {
		if (processingTimeout) clearTimeout(processingTimeout);
	});
</script>

<div class="space-y-6">
	<div class="grid md:grid-cols-2 gap-6 items-start">
		<Editor 
			label="Raw Text"
			placeholder="Enter raw text..."
			bind:value={rawValue}
			on:input={handleRawInput}
			dataTestId="raw-editor"
		>
			<div slot="actions">
				<button class="btn btn-ghost btn-xs text-muted-foreground hover:text-foreground" on:click={() => copyToClipboard(rawValue)}>Copy</button>
			</div>
		</Editor>

		<Editor 
			label="Encoded URI"
			placeholder="Enter encoded URI..."
			bind:value={encodedValue}
			on:input={handleEncodedInput}
			dataTestId="encoded-editor"
		>
			<div slot="actions">
				<button class="btn btn-ghost btn-xs text-muted-foreground hover:text-foreground" on:click={() => copyToClipboard(encodedValue)}>Copy</button>
			</div>
		</Editor>
	</div>

	{#if errorMessage}
		<p class="text-xs text-destructive font-medium uppercase tracking-tight" data-testid="error-message">{errorMessage}</p>
	{/if}
</div>
