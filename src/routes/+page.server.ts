import { fetchCourses } from '$lib/api';
import { getMockCourses } from '$lib/mocks/courses';
import type { CourseSummary } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	const result = await fetchCourses(fetch, { limit: 4, token: locals.accessToken ?? undefined });

	let featuredCourses: CourseSummary[] = getMockCourses(4);
	let usedFallback = false;

	if (result.data?.items && result.data.items.length > 0) {
		featuredCourses = result.data.items;
	} else {
		usedFallback = true;
	}

	return {
		featuredCourses,
		usedFallback
	};
};
