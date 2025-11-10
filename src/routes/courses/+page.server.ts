import { fetchCourses } from '$lib/api';
import { getMockCourses } from '$lib/mocks/courses';
import type { CourseSummary, DifficultyLevel } from '$lib/types';
import type { PageServerLoad } from './$types';

const isDifficulty = (value: string | null): value is DifficultyLevel | 'all' => {
	return value === 'beginner' || value === 'intermediate' || value === 'advanced' || value === 'all';
};

type SortOption = 'popular' | 'newest' | 'price_low' | 'price_high';

const isSortOption = (value: string | null): value is SortOption => {
	return value === 'popular' || value === 'newest' || value === 'price_low' || value === 'price_high';
};

const normalizeSortOption = (value: string | null): SortOption => {
	return isSortOption(value) ? value : 'popular';
};

const mapSortToApiParam = (value: SortOption): 'popular' | 'latest' | 'priceAsc' | 'priceDesc' => {
	switch (value) {
		case 'newest':
			return 'latest';
		case 'price_low':
			return 'priceAsc';
		case 'price_high':
			return 'priceDesc';
		default:
			return 'popular';
	}
};

const applyFallbackFilters = ({
	courses,
	search,
	difficulty,
	sort
}: {
	courses: CourseSummary[];
	search: string;
	difficulty: DifficultyLevel | 'all';
	sort: SortOption;
}) => {
	let filtered = [...courses];

	if (search) {
		const query = search.toLowerCase();
		filtered = filtered.filter((course) => {
			const titleMatch = course.title.toLowerCase().includes(query);
			const instructorMatch = course.instructor.toLowerCase().includes(query);
			const tagMatch = course.tags?.some((tag) => tag.toLowerCase().includes(query)) ?? false;
			return titleMatch || instructorMatch || tagMatch;
		});
	}

	if (difficulty !== 'all') {
		filtered = filtered.filter((course) => course.difficulty === difficulty);
	}

	const priceValue = (course: CourseSummary) => course.salePrice ?? course.originalPrice;
	const publishedAtValue = (course: CourseSummary) =>
		course.publishedAt ? Date.parse(course.publishedAt) : 0;
	const popularityScore = (course: CourseSummary) => course.reviewCount ?? 0;

	switch (sort) {
		case 'price_low':
			filtered.sort((a, b) => priceValue(a) - priceValue(b));
			break;
		case 'price_high':
			filtered.sort((a, b) => priceValue(b) - priceValue(a));
			break;
		case 'newest':
			filtered.sort((a, b) => publishedAtValue(b) - publishedAtValue(a));
			break;
		default:
			filtered.sort((a, b) => popularityScore(b) - popularityScore(a));
			break;
	}

	return filtered;
};

export const load: PageServerLoad = async ({ fetch, url, locals }) => {
	const search = url.searchParams.get('search') ?? '';
	const difficultyParam = url.searchParams.get('difficulty');
	const difficulty = isDifficulty(difficultyParam) ? difficultyParam : 'all';
	const sort = normalizeSortOption(url.searchParams.get('sort'));
	const cursor = url.searchParams.get('cursor');
	const limit = 9;

	const result = await fetchCourses(fetch, {
		search: search || null,
		difficulty,
		sort: mapSortToApiParam(sort),
		cursor,
		limit,
		token: locals.accessToken ?? undefined
	});

	let courses: CourseSummary[] = [];
	let nextCursor: string | null = null;
	let usedFallback = false;

	if (result.data?.items) {
		courses = result.data.items;
		nextCursor = result.data.nextCursor ?? null;
	} else {
		const filteredFallback = applyFallbackFilters({
			courses: getMockCourses(),
			search,
			difficulty,
			sort
		});
		courses = filteredFallback.slice(0, limit);
		usedFallback = true;
	}

	return {
		courses,
		nextCursor,
		filters: {
			search,
			difficulty,
			sort
		},
		usedFallback,
		error: result.error ?? null
	};
};
