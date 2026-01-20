<script lang="ts">
	import { onMount } from 'svelte';
	import { convertTimestamp, type TimestampParts } from '$lib/utils/timestamp';

	let currentUnix = Math.floor(Date.now() / 1000);
	let input = currentUnix.toString();
	let parts: TimestampParts | null = null;
	let timer: number;

	$: parts = convertTimestamp(input);

	function updateCurrent() {
		currentUnix = Math.floor(Date.now() / 1000);
	}

	function setNow() {
		input = currentUnix.toString();
	}

	onMount(() => {
		timer = window.setInterval(updateCurrent, 1000);
		return () => clearInterval(timer);
	});
</script>

<div class="space-y-8">
	<!-- Hero Live Clock -->
	<div class="card p-8 bg-primary/5 border-primary/20 flex flex-col items-center justify-center text-center space-y-4">
		<span class="text-xs font-bold uppercase tracking-[0.2em] text-primary/60">Current Unix Epoch</span>
		<div class="text-6xl font-mono font-black tracking-tighter text-primary">
			{currentUnix}
		</div>
		<button class="btn btn-secondary btn-sm" on:click={setNow}>
			Use Current Time
		</button>
	</div>

	<div class="grid md:grid-cols-3 gap-8">
		<!-- Left: Input -->
		<div class="md:col-span-1 space-y-4">
			<div class="space-y-2">
				<label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Input</label>
				<input 
					type="text" 
					bind:value={input} 
					placeholder="Unix timestamp or date string..."
					class="w-full h-12 px-4 bg-muted/5 border rounded-lg font-mono text-lg focus:ring-2 focus:ring-primary outline-none transition-all"
				/>
				<p class="text-[10px] text-muted-foreground">Accepts seconds, milliseconds, or ISO dates.</p>
			</div>
		</div>

		<!-- Right: Conversions -->
		<div class="md:col-span-2 space-y-4">
			<label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Conversions</label>
			
			{#if parts}
				<div class="grid gap-3">
					<div class="flex items-center justify-between p-4 bg-muted/5 rounded-lg border group hover:border-primary/30 transition-colors">
						<div class="space-y-1">
							<span class="text-[10px] font-bold uppercase text-muted-foreground">ISO 8601</span>
							<div class="font-mono text-sm">{parts.iso}</div>
						</div>
						<button class="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity" on:click={() => navigator.clipboard.writeText(parts?.iso || '')}>
							Copy
						</button>
					</div>

					<div class="flex items-center justify-between p-4 bg-muted/5 rounded-lg border group hover:border-primary/30 transition-colors">
						<div class="space-y-1">
							<span class="text-[10px] font-bold uppercase text-muted-foreground">Local Time</span>
							<div class="font-mono text-sm">{parts.local}</div>
						</div>
						<button class="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity" on:click={() => navigator.clipboard.writeText(parts?.local || '')}>
							Copy
						</button>
					</div>

					<div class="flex items-center justify-between p-4 bg-muted/5 rounded-lg border group hover:border-primary/30 transition-colors">
						<div class="space-y-1">
							<span class="text-[10px] font-bold uppercase text-muted-foreground">Relative</span>
							<div class="font-mono text-sm capitalize">{parts.relative}</div>
						</div>
					</div>
				</div>
			{:else}
				<div class="p-12 text-center border-2 border-dashed rounded-lg text-muted-foreground italic">
					Invalid date or timestamp
				</div>
			{/if}
		</div>
	</div>
</div>
