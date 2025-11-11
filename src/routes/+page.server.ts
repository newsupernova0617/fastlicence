import { fetchCourses } from '$lib/api';
import type { CourseSummary } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	const result = await fetchCourses(fetch, { limit: 4, token: locals.accessToken ?? undefined });

	return {
		featuredCourses: result.data?.items ?? ([] as CourseSummary[]),
		usedFallback: !result.data
	};
};
