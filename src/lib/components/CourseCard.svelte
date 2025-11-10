<script lang="ts">
	import { formatCurrency, formatDifficulty } from '$lib/utils/format';
	import { createEventDispatcher } from 'svelte';
	import type { CourseSummary } from '$lib/types';

	const dispatch = createEventDispatcher<{ select: { courseId: string } }>();

	type Props = {
		course: CourseSummary;
		href?: string | null;
	};

	const { course, href } = $props() as Props;

const resolvedHref = $derived(
	href === undefined ? `/courses/${course.id}` : href
);
const hasDiscount = $derived(
	typeof course.salePrice === 'number' && course.salePrice < course.originalPrice
);

	const handleSelect = (event: Event) => {
		dispatch('select', { courseId: course.id });
		if (resolvedHref === null) {
			event.preventDefault();
		}
	};
</script>

<article class="group card-modern h-full overflow-hidden">
	{#if course.thumbnailUrl}
		<figure class="relative aspect-video overflow-hidden bg-base-200">
			<img
				src={course.thumbnailUrl}
				alt={`${course.title} 대표 이미지`}
				class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
				loading="lazy"
			/>
			<!-- Gradient overlay for better text readability -->
			<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

			{#if course.tags && course.tags.length > 0}
				<span class="badge badge-primary absolute left-3 top-3 shadow-lg glass-effect font-semibold">
					#{course.tags[0]}
				</span>
			{/if}

			{#if hasDiscount}
				<span class="badge badge-secondary absolute right-3 top-3 shadow-lg font-bold">
					{Math.round(((course.originalPrice - (course.salePrice ?? course.originalPrice)) / course.originalPrice) * 100)}% OFF
				</span>
			{/if}
		</figure>
	{/if}
	<a
		class="card-body gap-4 p-5"
		href={resolvedHref ?? undefined}
		onclick={handleSelect}
		data-sveltekit-preload-data="hover"
	>
		<div class="flex items-center justify-between text-xs font-medium">
			<span class="badge badge-outline badge-sm">{formatDifficulty(course.difficulty)}</span>
			{#if course.rating}
				<span class="flex items-center gap-1 text-warning">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
						<path
							d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10 13.347l-2.984 2.136c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L3.38 8.72c-.783-.57-.38-1.81.588-1.81H7.43a1 1 0 0 0 .95-.69z"
						/>
					</svg>
					<span class="font-bold text-base-content">{course.rating.toFixed(1)}</span>
					{#if course.reviewCount}
						<span class="text-base-content/50">({course.reviewCount})</span>
					{/if}
				</span>
			{/if}
		</div>

		<div class="space-y-2 min-h-[4rem]">
			<h3 class="text-lg font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
				{course.title}
			</h3>
			{#if course.subtitle}
				<p class="text-sm text-base-content/70 leading-snug line-clamp-2">{course.subtitle}</p>
			{/if}
		</div>

		<div class="flex items-center gap-2 text-sm text-base-content/60">
			<div class="flex items-center gap-1.5">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
				</svg>
				<span class="font-medium">{course.instructor}</span>
			</div>
			{#if course.lectureCount}
				<span class="text-base-content/40">·</span>
				<div class="flex items-center gap-1">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
					</svg>
					<span>{course.lectureCount}강</span>
				</div>
			{/if}
		</div>

		<div class="divider my-1"></div>

		<div class="flex items-center justify-between">
			<div class="space-y-0.5">
				{#if hasDiscount}
					<p class="text-xs text-base-content/50 line-through">{formatCurrency(course.originalPrice)}</p>
				{/if}
				<p class="text-2xl font-bold text-primary">
					{formatCurrency(hasDiscount ? (course.salePrice ?? course.originalPrice) : course.originalPrice)}
				</p>
			</div>
			<span class="btn btn-primary btn-sm gap-1.5 shadow-md group-hover:gap-2.5 transition-all">
				자세히 보기
				<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</span>
		</div>
	</a>
</article>
