<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import CommandPalette from '$lib/components/CommandPalette.svelte';

	onMount(() => {
		const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		
		function updateTheme() {
			if (darkModeMediaQuery.matches) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		}

		updateTheme();
		darkModeMediaQuery.addEventListener('change', updateTheme);
		
		return () => darkModeMediaQuery.removeEventListener('change', updateTheme);
	});
</script>

<slot />
<CommandPalette />
