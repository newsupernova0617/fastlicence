<script lang="ts">
	import { browser } from '$app/environment';
	import { createEventDispatcher } from 'svelte';
	import type { UserCourseSummary } from '$lib/types';

	type CourseSearchEvents = {
		search: { query: string };
	};

	let {
		courses = [],
		value = $bindable(''),
		isSearching = false,
		placeholder = '강의명, 키워드 검색...'
	} = $props<{
		courses?: UserCourseSummary[];
		value?: string;
		isSearching?: boolean;
		placeholder?: string;
	}>();

	const dispatch = createEventDispatcher<CourseSearchEvents>();

	let isModalOpen = $state(false);
	let dropdownOpen = $state(false);
	let suggestions = $state<UserCourseSummary[]>([]);

	let desktopInput = $state<HTMLInputElement | null>(null);
	let modalInput = $state<HTMLInputElement | null>(null);
	let hideDropdownTimer: ReturnType<typeof setTimeout> | null = null;

	const focusModalInput = () => {
		if (!browser) return;
		requestAnimationFrame(() => {
			modalInput?.focus();
			modalInput?.select();
		});
	};

	const updateDropdownVisibility = () => {
		dropdownOpen = value.trim().length > 0 && suggestions.length > 0;
	};

	const submitSearch = (query = value.trim()) => {
		if (!query) {
			return;
		}
		dispatch('search', { query });
		dropdownOpen = false;
		isModalOpen = false;
	};

	const handleSubmit = (event?: SubmitEvent) => {
		event?.preventDefault();
		submitSearch();
	};

	const handleSuggestionSelect = (course: UserCourseSummary) => {
		value = course.title;
		submitSearch(course.title.trim());
	};

	const handleFocusIn = () => {
		if (hideDropdownTimer) {
			clearTimeout(hideDropdownTimer);
			hideDropdownTimer = null;
		}
		updateDropdownVisibility();
	};

	const handleFocusOut = () => {
		hideDropdownTimer = setTimeout(() => {
			dropdownOpen = false;
		}, 120);
	};

	const openModal = () => {
		isModalOpen = true;
		focusModalInput();
	};

	const closeModal = () => {
		isModalOpen = false;
	};

	const clearSearch = () => {
		value = '';
		dropdownOpen = false;
		dispatch('search', { query: '' });
	};

	$effect(() => {
		const query = value.trim().toLowerCase();

		if (!query) {
			suggestions = [];
			dropdownOpen = false;
			return;
		}

		suggestions = courses
			.filter((course: UserCourseSummary) => course.title.toLowerCase().includes(query))
			.slice(0, 5);

		updateDropdownVisibility();
	});
</script>

<!-- Desktop search -->
<form
	role="search"
	class="hidden sm:flex items-center gap-3 w-full md:w-[420px]"
	onfocusin={handleFocusIn}
	onfocusout={handleFocusOut}
	onsubmit={handleSubmit}
>
	<div class="relative flex-1">
		<span class="sr-only">나의 강의 검색</span>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-base-content/50"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			aria-hidden="true"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
		</svg>
		<input
			bind:this={desktopInput}
			type="search"
			class="input input-bordered h-11 w-full pl-12 pr-12 text-sm border-2 border-base-300 rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/20"
			placeholder={placeholder}
			bind:value
			aria-label="수강 중인 강의 검색"
			role="combobox"
			aria-expanded={dropdownOpen}
			aria-controls="mypage-course-suggestions"
		/>
		{#if value}
			<button
				type="button"
				class="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70"
				onclick={clearSearch}
				aria-label="검색어 지우기"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		{/if}

		{#if dropdownOpen}
			<div class="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-base-200 bg-base-100 shadow-2xl">
				<p class="px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-base-content/50">추천 강의</p>
				<ul id="mypage-course-suggestions" role="listbox" aria-live="polite" class="max-h-64 overflow-y-auto">
					{#each suggestions as course (course.courseId)}
						<li>
							<button
								type="button"
								class="w-full px-4 py-3 text-left hover:bg-base-200/60 transition-colors flex items-center gap-3"
								onclick={() => handleSuggestionSelect(course)}
								onmousedown={(event) => event.preventDefault()}
							>
								<div class="flex-1 min-w-0">
									<p class="text-sm font-semibold text-base-content line-clamp-1">{course.title}</p>
									{#if course.lastLectureTitle}
										<p class="text-xs text-base-content/60 line-clamp-1">{course.lastLectureTitle}</p>
									{/if}
								</div>
								<span class="badge badge-ghost badge-sm font-medium text-xs">{course.progressPercent}%</span>
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
	<button
		type="submit"
		class="btn btn-outline border-2 border-primary text-primary hover:bg-primary/10 hover:border-primary min-w-[96px] rounded-2xl h-11 px-6"
		class:loading={isSearching}
		aria-label="검색 실행"
	>
		{#if !isSearching}
			검색
		{/if}
	</button>
</form>

<!-- Mobile shortcut -->
<div class="sm:hidden w-full">
	<button
		type="button"
		class="btn btn-outline btn-sm w-full justify-start gap-2 border-2 border-dashed border-base-300"
		onclick={openModal}
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
		</svg>
		<span class="text-sm font-semibold text-base-content/80">{value ? `"${value}" 다시 검색` : '강의 검색'}</span>
	</button>
</div>

{#if isModalOpen}
	<dialog class="modal modal-open animate-fade-in" open>
		<div class="modal-box space-y-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-xs uppercase font-semibold text-primary tracking-wider">Search</p>
					<h2 class="text-xl font-bold">나의 강의 검색</h2>
				</div>
				<button type="button" class="btn btn-ghost btn-sm btn-circle" onclick={closeModal} aria-label="검색 닫기">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<form class="space-y-3" onsubmit={handleSubmit}>
				<label class="form-control gap-2">
					<span class="text-xs font-semibold text-base-content/60">검색어</span>
					<div class="relative">
						<input
							bind:this={modalInput}
							type="search"
							class="input input-bordered w-full pl-12 border-2 border-base-300 rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/20"
							placeholder={placeholder}
							bind:value
							aria-label="마이페이지 강의 검색"
						/>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						{#if value}
							<button
								type="button"
								class="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70"
								onclick={clearSearch}
								aria-label="검색어 지우기"
							>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						{/if}
					</div>
				</label>

				<button type="submit" class="btn btn-primary w-full gap-2" class:loading={isSearching}>
					{#if !isSearching}
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						검색 실행
					{/if}
				</button>
			</form>

			<div class="divider my-1"></div>

			{#if value && suggestions.length === 0}
				<div class="rounded-2xl border border-dashed border-base-300 p-4 text-sm text-base-content/70">
					<p>검색어와 일치하는 강의를 찾지 못했습니다.</p>
					<button type="button" class="btn btn-link btn-xs px-0 text-primary" onclick={clearSearch}>검색어 초기화</button>
				</div>
			{:else if suggestions.length > 0}
				<div class="space-y-2">
					<p class="text-xs font-semibold text-base-content/50 uppercase tracking-wider">추천 강의</p>
					<ul class="space-y-2 max-h-60 overflow-y-auto">
						{#each suggestions as course (course.courseId)}
							<li>
								<button
									type="button"
									class="w-full rounded-xl border border-base-200 px-4 py-3 text-left hover:border-primary/40 hover:bg-primary/5 transition-colors"
									onclick={() => handleSuggestionSelect(course)}
								>
									<p class="text-sm font-semibold line-clamp-1">{course.title}</p>
									{#if course.lastLectureTitle}
										<p class="text-xs text-base-content/60 mt-0.5">{course.lastLectureTitle}</p>
									{/if}
								</button>
							</li>
						{/each}
					</ul>
				</div>
			{:else}
				<p class="text-sm text-base-content/60">최근 학습한 강의명을 입력해 빠르게 찾아보세요.</p>
			{/if}
		</div>
		<form method="dialog" class="modal-backdrop bg-black/40 backdrop-blur-sm" onsubmit={closeModal}>
			<button aria-label="검색 닫기"></button>
		</form>
	</dialog>
{/if}
