<script lang="ts">
import { resolveAssetUrl } from "@/utils/asset-url";

interface Props {
	cover?: string;
}

const { cover = "" }: Props = $props();

// 同页可能存在多个播放器实例，clipPath 的 id 必须唯一
const clipId = `vinyl-label-${Math.random().toString(36).slice(2, 9)}`;
const coverUrl = $derived(cover ? resolveAssetUrl(cover) : "");

const GROOVE_RADII = [46, 43.5, 41, 38.5, 36, 33.5];
</script>

<svg viewBox="0 0 100 100" class="vinyl" aria-hidden="true">
	<defs>
		<clipPath id={clipId}>
			<circle cx="50" cy="50" r="29" />
		</clipPath>
		<linearGradient id={`${clipId}-sheen`} x1="0" y1="0" x2="1" y2="1">
			<stop offset="0%" stop-color="#ffffff" stop-opacity="0.16" />
			<stop offset="45%" stop-color="#ffffff" stop-opacity="0" />
			<stop offset="100%" stop-color="#ffffff" stop-opacity="0.08" />
		</linearGradient>
	</defs>

	<circle cx="50" cy="50" r="50" fill="#161616" />
	<g fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="0.7">
		{#each GROOVE_RADII as radius}
			<circle cx="50" cy="50" r={radius} />
		{/each}
	</g>
	<circle cx="50" cy="50" r="50" fill={`url(#${clipId}-sheen)`} />

	{#if coverUrl}
		<image
			href={coverUrl}
			x="21"
			y="21"
			width="58"
			height="58"
			preserveAspectRatio="xMidYMid slice"
			clip-path={`url(#${clipId})`}
		/>
	{:else}
		<circle cx="50" cy="50" r="29" fill="var(--primary)" />
	{/if}

	<circle
		cx="50"
		cy="50"
		r="29"
		fill="none"
		stroke="#000000"
		stroke-opacity="0.3"
		stroke-width="1.2"
	/>
	<circle cx="50" cy="50" r="4.2" fill="#0c0c0c" />
	<circle
		cx="50"
		cy="50"
		r="4.2"
		fill="none"
		stroke="#ffffff"
		stroke-opacity="0.14"
		stroke-width="0.7"
	/>
</svg>

<style>
	.vinyl {
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
