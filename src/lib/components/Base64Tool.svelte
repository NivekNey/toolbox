<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { encodeBase64, decodeBase64 } from '$lib/utils/base64';

	let mode: 'encode' | 'decode' = 'encode';
	let inputValue = '';
	let outputValue = '';
	let errorMessage = '';
	let copyButtonText = 'Copy';
	let inputLabel = 'Plain Text';
	let outputLabel = 'Base64';
	let isLoading = false;
	let processingTimeout: number | null = null;

	function processInput() {
		if (!inputValue) {
			outputValue = '';
			errorMessage = '';
			return;
		}

		isLoading = true;
		
		// Clear any existing timeout
		if (processingTimeout) {
			clearTimeout(processingTimeout);
		}

		// Process with debounce for performance
		processingTimeout = setTimeout(() => {
			try {
				if (mode === 'encode') {
					outputValue = encodeBase64(inputValue);
				} else {
					outputValue = decodeBase64(inputValue);
				}
				errorMessage = '';
			} catch (error) {
				outputValue = '';
				errorMessage = error instanceof Error ? error.message : 'Invalid input';
			} finally {
				isLoading = false;
			}
		}, 50);
	}

	function toggleMode() {
		if (mode === 'encode') {
			mode = 'decode';
			// Swap content when switching
			const temp = inputValue;
			inputValue = outputValue;
			outputValue = temp;
		} else {
			mode = 'encode';
			// Swap content when switching
			const temp = inputValue;
			inputValue = outputValue;
			outputValue = temp;
		}
		
		updateLabels();
		clearError();
	}

	function updateLabels() {
		if (mode === 'encode') {
			inputLabel = 'Plain Text';
			outputLabel = 'Base64';
		} else {
			inputLabel = 'Base64';
			outputLabel = 'Plain Text';
		}
	}

	function clearError() {
		errorMessage = '';
	}

	function clearAll() {
		inputValue = '';
		outputValue = '';
		errorMessage = '';
	}

	async function copyToClipboard() {
		if (!outputValue) return;

		try {
			await navigator.clipboard.writeText(outputValue);
			copyButtonText = 'Copied!';
			setTimeout(() => {
				copyButtonText = 'Copy';
			}, 1500);
		} catch (error) {
			copyButtonText = 'Failed';
			setTimeout(() => {
				copyButtonText = 'Copy';
			}, 1500);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		// Ctrl+A or Cmd+A to select all
		if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
			event.preventDefault();
			const textarea = event.target as HTMLTextAreaElement;
			textarea.select();
		}

		// Escape to clear
		if (event.key === 'Escape') {
			event.preventDefault();
			clearAll();
		}
	}

	onMount(() => {
		// Focus input on mount
		const inputElement = document.querySelector('[data-testid="input-textarea"]') as HTMLTextAreaElement;
		if (inputElement) {
			inputElement.focus();
		}
	});

	onDestroy(() => {
		if (processingTimeout) {
			clearTimeout(processingTimeout);
		}
	});

	$: processInput();
</script>