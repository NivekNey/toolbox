<script lang="ts">
	import { onMount } from 'svelte';
	import { getTimezoneGrid, COMMON_TIMEZONES, getAllTimezones, type TimezoneRow } from '$lib/utils/timezone';

	let baseDate = new Date();
	let selectedZones = ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo'];
	let rows: TimezoneRow[] = [];
	let scrollContainer: HTMLDivElement;
	let newZone = '';
	let allTimezones = getAllTimezones();

	$: {
		rows = selectedZones.map(zone => getTimezoneGrid(zone, baseDate));
	}

	function shiftDate(days: number) {
		const next = new Date(baseDate);
		next.setDate(next.getDate() + days);
		baseDate = next;
	}

	function addZone() {
		if (newZone && !selectedZones.includes(newZone)) {
			selectedZones = [...selectedZones, newZone];
			newZone = '';
		}
	}

	function removeZone(zone: string) {
		selectedZones = selectedZones.filter(z => z !== zone);
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
		if (scrollContainer) {
			const currentHour = new Date().getHours();
			scrollContainer.scrollLeft = (currentHour - 2) * 80;
		}
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<div class="space-y-6">
	<!-- Toolbar -->
	<div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b">
		<div class="flex items-center gap-6">
			<h2 class="text-lg font-bold">Timezone Visualizer</h2>
			<div class="flex items-center gap-4 text-[10px] text-muted-foreground uppercase font-bold tracking-widest bg-muted/30 px-3 py-1.5 rounded-full border">
				<div class="flex items-center gap-1.5 border-r pr-3">
					<kbd class="px-1 py-0.5 rounded border bg-background font-mono text-[9px]">A</kbd>
					<kbd class="px-1 py-0.5 rounded border bg-background font-mono text-[9px]">←</kbd>
					<span class="ml-1">Prev Day</span>
				</div>
				<div class="flex items-center gap-1.5 pl-1">
					<kbd class="px-1 py-0.5 rounded border bg-background font-mono text-[9px]">D</kbd>
					<kbd class="px-1 py-0.5 rounded border bg-background font-mono text-[9px]">→</kbd>
					<span class="ml-1">Next Day</span>
				</div>
			</div>
		</div>
		
		<div class="flex items-center gap-3">
			<div class="flex items-center bg-muted/50 rounded-lg border focus-within:ring-2 focus-within:ring-primary transition-all">
				<select 
					bind:value={newZone}
					class="bg-transparent border-none text-xs px-3 h-9 outline-none min-w-[180px]"
				>
					<option value="" disabled>Add Timezone...</option>
					{#each allTimezones as zone}
						<option value={zone}>{zone}</option>
					{/each}
				</select>
				<button 
					class="px-3 h-9 text-xs font-bold uppercase text-primary hover:bg-primary/5 transition-colors border-l"
					on:click={addZone}
				>
					Add
				</button>
			</div>
			<button class="btn btn-secondary btn-sm h-9" on:click={() => (baseDate = new Date())}>Today</button>
		</div>
	</div>

	<!-- Visualizer -->
	<div class="relative flex border rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm min-h-[400px]">
		<!-- Zone List (Left Sidebar) -->
		<div class="w-56 flex-shrink-0 bg-zinc-50 dark:bg-zinc-900 border-r z-20 shadow-lg">
			<div class="h-12 border-b bg-zinc-100/50 dark:bg-zinc-800/50 flex items-center px-4 sticky top-0">
				<span class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Timezone</span>
			</div>
			{#each rows as row}
				<div class="h-20 border-b px-4 flex items-center justify-between group hover:bg-primary/5 transition-colors">
					<div class="flex flex-col gap-0.5 overflow-hidden">
						<span class="text-xs font-bold truncate pr-2" title={row.name}>{row.name.split('/').pop()?.replace('_', ' ')}</span>
						<div class="flex items-center gap-2">
							<span class="text-[9px] text-muted-foreground font-mono">GMT {row.offset >= 0 ? '+' : ''}{row.offset}</span>
							{#if row.hours[0].isDST}
								<span class="text-[8px] bg-warning/10 text-warning px-1 rounded font-bold uppercase tracking-tighter border border-warning/20">DST</span>
							{/if}
						</div>
					</div>
					<button 
						class="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 text-destructive rounded transition-all"
						on:click={() => removeZone(row.name)}
						title="Remove"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
					</button>
				</div>
			{/each}
		</div>

		<!-- Time Grid (Scrollable) -->
		<div 
			bind:this={scrollContainer}
			class="flex-1 overflow-x-auto scroll-smooth hide-scrollbar bg-slate-50/30 dark:bg-zinc-950"
		>
			<div class="min-w-max flex flex-col">
				<!-- Header (Hours + Dates) -->
				<div class="h-12 border-b flex min-w-max bg-zinc-100/50 dark:bg-zinc-800/50 sticky top-0 z-10">
					{#each rows[0]?.hours || [] as hour, i}
						<div class="w-20 flex-shrink-0 flex flex-col items-center justify-center border-r border-zinc-200 dark:border-zinc-800 relative
									{hour.hour === 0 ? 'bg-primary/5 border-l-2 border-l-primary/30' : ''}">
							{#if hour.hour === 0 || i === 0}
								<div class="absolute -top-1 left-0 right-0 h-1 bg-primary"></div>
								<div class="absolute top-1 left-2 text-[8px] font-black uppercase text-primary tracking-tighter whitespace-nowrap">
									{hour.fullDate}
								</div>
							{/if}
							<span class="text-[11px] font-black font-mono {hour.hour === 0 ? 'text-primary' : 'text-foreground'}">
								{hour.hour === 0 ? 'MIDN' : hour.label}
							</span>
						</div>
					{/each}
				</div>

				<!-- Rows -->
				{#each rows as row}
					<div class="h-20 border-b border-zinc-100 dark:border-zinc-800 flex min-w-max group">
						{#each row.hours as hour}
							<div 
								class="w-20 flex-shrink-0 border-r border-zinc-100 dark:border-zinc-900 flex flex-col items-center justify-center transition-all relative
									   {hour.isWorkingHours ? 'bg-white dark:bg-zinc-950 border-y-zinc-200 dark:border-y-zinc-800 ring-1 ring-inset ring-success/10' : 'bg-zinc-500/5 dark:bg-zinc-400/5'}
									   {hour.hour === 0 ? 'border-l-2 border-l-primary/10' : ''}"
							>
								{#if hour.isWorkingHours}
									<div class="absolute inset-0 bg-success/5 pointer-events-none"></div>
								{/if}
								<span class="text-xs font-mono font-bold {hour.isWorkingHours ? 'text-foreground' : 'text-muted-foreground'}">{hour.hour}</span>
								<span class="text-[8px] opacity-40 font-bold">{hour.hour >= 12 ? 'PM' : 'AM'}</span>
								{#if hour.hour === 12}
									<div class="absolute top-1 text-[7px] font-black text-warning tracking-tighter">NOON</div>
								{/if}
							</div>
						{/each}
					</div>
				{/each}
			</div>
		</div>
		
		<!-- Center Needle (Current Time Marker) -->
		<div class="absolute left-56 top-0 bottom-0 pointer-events-none z-30">
			<!-- Line that moves could be complex, for now we keep a fixed "start" needle or visually indicate today -->
			<div class="w-px h-full bg-primary/40 shadow-[0_0_12px_rgba(var(--primary),0.3)] border-r border-primary/20"></div>
			<div class="bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-r mt-2">TODAY'S START</div>
		</div>
	</div>

	<!-- Info Bar -->
	<div class="grid md:grid-cols-2 gap-4">
		<div class="p-6 bg-muted/20 rounded-xl border border-dashed flex items-center justify-center gap-4 text-center">
			<div class="flex items-center gap-2">
				<div class="w-3 h-3 rounded-sm bg-success/20 border border-success/40"></div>
				<span class="text-xs font-bold uppercase tracking-wider">Business Hours</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="w-3 h-3 rounded-sm bg-background border"></div>
				<span class="text-xs font-bold uppercase tracking-wider">Off Hours</span>
			</div>
		</div>
		
		<div class="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-center text-center">
			<p class="text-xs font-medium text-muted-foreground leading-relaxed">
				<span class="text-primary font-bold">Pro Tip:</span> 
				Dragging the timeline or using the keys helps visualize overlap for global meetings. 
				<span class="text-warning font-bold">DST</span> marks zones currently observing summer time.
			</p>
		</div>
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
	
	/* Smooth transitions for row highlights */
	.h-20:hover {
		filter: brightness(0.98);
	}
</style>
