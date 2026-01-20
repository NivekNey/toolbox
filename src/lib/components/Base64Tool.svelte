<script lang="ts">
	import { onDestroy } from 'svelte';
	import { encodeBase64, decodeBase64, isValidBase64 } from '$lib/utils/base64';
	import Editor from './Editor.svelte';

	let plainText = '';
	let base64Text = '';
	let errorMessage = '';
	let isSyncing = false;
	let syncTimeout: number;

	function handlePlainInput(event: CustomEvent<string>) {
		plainText = event.detail;
		isSyncing = true;
		clearTimeout(syncTimeout);
		syncTimeout = window.setTimeout(() => {
			try {
				base64Text = plainText ? encodeBase64(plainText) : '';
				errorMessage = '';
			} catch (e) {
				errorMessage = 'Encoding failed';
			} finally {
				isSyncing = false;
			}
		}, 100);
	}

	function handleBase64Input(event: CustomEvent<string>) {
		base64Text = event.detail;
		isSyncing = true;
		clearTimeout(syncTimeout);
		syncTimeout = window.setTimeout(() => {
			if (!base64Text) {
				plainText = '';
				errorMessage = '';
				isSyncing = false;
				return;
			}
			if (isValidBase64(base64Text)) {
				try {
					plainText = decodeBase64(base64Text);
					errorMessage = '';
				} catch (e) {
					errorMessage = 'Decoding failed';
				}
			} else {
				errorMessage = 'Invalid Base64 format';
			}
			isSyncing = false;
		}, 100);
	}

	async function copyToClipboard(text: string) {
		if (!text) return;
		await navigator.clipboard.writeText(text);
	}

	onDestroy(() => {
		clearTimeout(syncTimeout);
	});
</script>

<div class="space-y-6">
	<div class="grid md:grid-cols-2 gap-6 items-start">
		<Editor 
			label="Plain Text"
			placeholder="Enter plain text..."
			bind:value={plainText}
			on:input={handlePlainInput}
			dataTestId="plain-editor"
		>
			<div slot="actions">
				<button class="btn btn-ghost btn-xs text-muted-foreground hover:text-foreground" on:click={() => copyToClipboard(plainText)}>Copy</button>
			</div>
		</Editor>

		<Editor 
			label="Base64"
			placeholder="Enter base64 text..."
			bind:value={base64Text}
			on:input={handleBase64Input}
			dataTestId="base64-editor"
		>
			<div slot="actions">
				<button class="btn btn-ghost btn-xs text-muted-foreground hover:text-foreground" on:click={() => copyToClipboard(base64Text)}>Copy</button>
			</div>
		</Editor>
	</div>

	{#if errorMessage}
		<p class="text-xs text-destructive font-medium uppercase tracking-tight" data-testid="error-message">{errorMessage}</p>
	{/if}
</div>