<script lang="ts">
	import { onMount } from 'svelte';
	import { getTimezoneGrid, COMMON_TIMEZONES, type TimezoneRow } from '$lib/utils/timezone';

	let baseDate = new Date();
	let selectedZones = ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo'];
	let rows: TimezoneRow[] = [];
	let scrollContainer: HTMLDivElement;

	$: {
		rows = selectedZones.map(zone => getTimezoneGrid(zone, baseDate));
	}

	function shiftDate(days: number) {
		const next = new Date(baseDate);
		next.setDate(next.getDate() + days);
		baseDate = next;
	}

	function handleKeydown(event: KeyboardEvent) {
		const key = event.key.toLowerCase();
		if (key === 'd' || key === 'arrowright') {
			shiftDate(1);
			event.preventDefault();
		} else if (key === 'a' || key === 'arrowleft') {
			shiftDate(-1);
			event.preventDefault();
		}
	}

	onMount(() => {
		// Scroll to current hour roughly (middle of the 48h range)
		if (scrollContainer) {
			const currentHour = new Date().getHours();
			scrollContainer.scrollLeft = currentHour * 80;
		}
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<div class="space-y-6">
	<!-- Toolbar -->
	<div class="flex items-center justify-between pb-4 border-b">
		<div class="flex items-center gap-4">
			<h2 class="text-lg font-bold">Timezone Visualizer</h2>
			<div class="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
				<kbd class="px-1.5 py-0.5 rounded border bg-muted">A</kbd> Previous Day
				<kbd class="px-1.5 py-0.5 rounded border bg-muted">D</kbd> Next Day
			</div>
		</div>
		<div class="flex items-center gap-2">
			<button class="btn btn-secondary btn-sm" on:click={() => (baseDate = new Date())}>Today</button>
		</div>
	</div>

	<!-- Visualizer -->
	<div class="relative flex border rounded-xl overflow-hidden bg-background shadow-sm">
		<!-- Zone List (Left Sidebar) -->
		<div class="w-48 flex-shrink-0 bg-muted/5 border-r z-10">
			<div class="h-10 border-b bg-muted/20 flex items-center px-4">
				<span class="text-[10px] font-bold uppercase text-muted-foreground">Timezone</span>
			</div>
			{#each rows as row}
				<div class="h-20 border-b px-4 flex flex-col justify-center gap-1 group hover:bg-muted/10">
					<span class="text-xs font-bold truncate" title={row.name}>{row.name.split('/').pop()?.replace('_', ' ')}</span>
					<span class="text-[10px] text-muted-foreground">GMT {row.offset >= 0 ? '+' : ''}{row.offset}</span>
				</div>
			{/each}
		</div>

		<!-- Time Grid (Scrollable) -->
		<div 
			bind:this={scrollContainer}
			class="flex-1 overflow-x-auto scroll-smooth hide-scrollbar"
		>
			<div class="min-w-max flex flex-col">
				<!-- Header (Hours) -->
				<div class="h-10 border-b flex min-w-max bg-muted/20">
					{#each rows[0]?.hours || [] as hour}
						<div class="w-20 flex-shrink-0 flex flex-col items-center justify-center border-r border-muted/20">
							<span class="text-[10px] font-bold text-muted-foreground">{hour.label}</span>
							<span class="text-[8px] text-muted-foreground opacity-50">{hour.dayLabel}</span>
						</div>
					{/each}
				</div>

				<!-- Rows -->
				{#each rows as row}
					<div class="h-20 border-b flex min-w-max group">
						{#each row.hours as hour}
							<div 
								class="w-20 flex-shrink-0 border-r border-muted/5 flex flex-col items-center justify-center transition-colors
									   {hour.isDaylight ? 'bg-background hover:bg-primary/5' : 'bg-muted/10 hover:bg-primary/10'}
									   {hour.hour === 0 ? 'border-l-2 border-l-primary/30' : ''}"
							>
								<span class="text-xs font-mono font-medium">{hour.hour}</span>
								<span class="text-[8px] opacity-40">{hour.hour >= 12 ? 'PM' : 'AM'}</span>
							</div>
						{/each}
					</div>
				{/each}
			</div>
		</div>
		
		<!-- Current Time Needle (Fixed position indicator fallback) -->
		<div class="absolute left-48 top-0 bottom-0 pointer-events-none">
			<div class="w-px h-full bg-primary/20 shadow-[0_0_8px_rgba(var(--primary),0.2)]"></div>
		</div>
	</div>

	<div class="p-6 bg-muted/5 rounded-lg border border-dashed text-center">
		<p class="text-sm text-muted-foreground">
			Use <kbd class="px-1.5 py-0.5 rounded border bg-background font-mono">←</kbd> and <kbd class="px-1.5 py-0.5 rounded border bg-background font-mono">→</kbd> to navigate through time.
		</p>
	</div>
</div>

<style>
	.hide-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.hide-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
