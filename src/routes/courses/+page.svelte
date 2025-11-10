<script lang="ts">
	import CourseCard from '$lib/components/CourseCard.svelte';
	import type { CourseSummary, DifficultyLevel } from '$lib/types';

	type PageData = {
		courses: CourseSummary[];
		nextCursor: string | null;
		filters: {
			search: string;
			difficulty: DifficultyLevel | 'all';
			sort: string;
		};
		usedFallback: boolean;
		error: { code: string; message: string } | null;
	};

	let { data } = $props<{ data: PageData }>();

	const buildMoreLink = () => {
		if (!data.nextCursor) return '#';
		const params = new URLSearchParams();
		if (data.filters.search) params.set('search', data.filters.search);
		if (data.filters.difficulty && data.filters.difficulty !== 'all') {
			params.set('difficulty', data.filters.difficulty);
		}
		if (data.filters.sort) params.set('sort', data.filters.sort);
		params.set('cursor', data.nextCursor);
		return `?${params.toString()}`;
	};
</script>

<svelte:head>
	<title>강의 리스트 | FastLicense</title>
	<meta name="description" content="난이도, 검색어, 정렬 옵션으로 원하는 강의를 찾아보세요." />
	<meta property="og:title" content="강의 리스트 | FastLicense" />
	<meta property="og:description" content="난이도별 맞춤 강의를 검색해보세요." />
</svelte:head>

	<section class="space-y-8 animate-fade-in">
		<div class="space-y-4">
			<div class="flex items-center gap-3">
				<div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
					</svg>
				</div>
				<div>
					<h1 class="text-4xl font-bold">강의 전체</h1>
					<p class="text-base text-base-content/60 mt-1">검색과 필터로 원하는 강의를 빠르게 찾아보세요</p>
				</div>
			</div>
		</div>

		<form method="get" class="card-modern overflow-hidden">
			<div class="bg-gradient-to-r from-primary/5 to-accent/5 p-5 border-b border-base-300">
				<div class="flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
					</svg>
					<h2 class="text-lg font-bold">검색 & 필터</h2>
				</div>
			</div>

			<div class="space-y-6 p-6">
				<div class="flex flex-col gap-3 md:flex-row md:items-center">
					<label class="flex-1">
						<span class="sr-only">강의 검색</span>
						<div class="relative">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/50"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
							<input
								type="search"
								name="search"
								placeholder="강의명, 강사명, 키워드를 입력하세요"
								value={data.filters.search}
								class="input input-bordered h-12 w-full border-2 border-base-300/80 pl-12 pr-32 text-base focus:border-primary focus:ring-2 focus:ring-primary/20"
							/>
							<button
								type="submit"
								class="btn btn-primary absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border-2 border-primary/80 bg-primary px-6 text-base-content font-semibold shadow-lg hover:shadow-xl"
							>
								검색
							</button>
						</div>
					</label>
					{#if data.filters.search}
						<a
							href="/courses"
							class="btn btn-ghost btn-sm text-base-content/70 hover:text-base-content gap-2"
						>
							검색 초기화
						</a>
					{/if}
				</div>

				<div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
					<fieldset class="flex-1 space-y-3">
						<legend class="text-sm font-semibold text-base-content/80">난이도</legend>
						<div class="flex flex-wrap gap-3">
							{#each [
								{ value: 'all', label: '전체', emoji: '🌟' },
								{ value: 'beginner', label: '초급', emoji: '🟢' },
								{ value: 'intermediate', label: '중급', emoji: '🟡' },
								{ value: 'advanced', label: '고급', emoji: '🔴' }
							] as option}
								<label class="cursor-pointer">
									<input
										type="radio"
										name="difficulty"
										value={option.value}
										class="peer sr-only"
										checked={data.filters.difficulty === option.value}
										onchange={(event) => event.currentTarget.form?.requestSubmit()}
									/>
									<span
										class="flex items-center gap-2 rounded-2xl border border-base-300 px-4 py-2 text-sm font-medium text-base-content/80 transition-all peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary"
									>
										<span>{option.emoji}</span>
										{option.label}
									</span>
								</label>
							{/each}
						</div>
					</fieldset>

					<fieldset class="flex-1 space-y-3">
						<legend class="text-sm font-semibold text-base-content/80">정렬</legend>
						<div class="flex flex-wrap gap-3">
							{#each [
								{ value: 'popular', label: '인기순', icon: '🔥' },
								{ value: 'newest', label: '최신순', icon: '✨' },
								{ value: 'price_low', label: '가격 낮은순', icon: '💰' },
								{ value: 'price_high', label: '가격 높은순', icon: '💎' }
							] as option}
								<label class="cursor-pointer">
									<input
										type="radio"
										name="sort"
										value={option.value}
										class="peer sr-only"
										checked={data.filters.sort === option.value}
										onchange={(event) => event.currentTarget.form?.requestSubmit()}
									/>
									<span
										class="flex items-center gap-2 rounded-2xl border border-base-300 px-4 py-2 text-sm font-medium text-base-content/80 transition-all peer-checked:border-accent peer-checked:bg-accent/10 peer-checked:text-accent"
									>
										<span>{option.icon}</span>
										{option.label}
									</span>
								</label>
							{/each}
						</div>
					</fieldset>
				</div>
			</div>
		</form>

	{#if data.usedFallback}
		<div role="alert" class="alert alert-warning shadow-md rounded-2xl">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
			</svg>
			<span>실제 API 응답 대신 임시 데이터를 보여주고 있습니다.</span>
		</div>
	{/if}

	{#if data.error && !data.usedFallback}
		<div role="alert" class="alert alert-error shadow-md rounded-2xl">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span>{data.error.message}</span>
		</div>
	{/if}

	{#if data.courses.length === 0}
		<div class="card-modern p-16 text-center">
			<div class="flex flex-col items-center gap-4">
				<div class="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<div class="space-y-2">
					<p class="text-lg font-semibold text-base-content">조건에 맞는 강의가 없습니다</p>
					<p class="text-sm text-base-content/60">검색어나 필터를 변경해보세요</p>
				</div>
				<button type="button" class="btn btn-primary btn-sm" onclick={() => window.location.href = '/courses'}>
					전체 강의 보기
				</button>
			</div>
		</div>
	{:else}
		<div>
			<div class="flex items-center justify-between mb-4">
				<p class="text-sm text-base-content/60">
					총 <span class="font-bold text-primary">{data.courses.length}개</span>의 강의를 찾았습니다
				</p>
			</div>
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each data.courses as course, index}
					<div style="animation-delay: {index * 50}ms" class="animate-fade-in">
						<CourseCard {course} />
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if data.nextCursor}
		<div class="flex justify-center pt-8">
			<a href={buildMoreLink()} class="btn btn-outline btn-primary btn-lg gap-2 hover-scale group">
				더 많은 강의 보기
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			</a>
		</div>
	{/if}
</section>
