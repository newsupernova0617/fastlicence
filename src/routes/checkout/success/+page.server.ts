import { confirmPayment, fetchCourseDetail } from '$lib/api';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, fetch, locals }) => {
	const orderNumber = url.searchParams.get('orderNumber');

	if (!orderNumber) {
		throw redirect(302, '/courses');
	}

	const confirmation = await confirmPayment(fetch, { orderNumber }, {
		token: locals.accessToken ?? undefined
	});

	if (!confirmation.data) {
		throw error(400, confirmation.error?.message ?? '결제 상태를 확인할 수 없습니다.');
	}

	let course = null;
	let courseUsedFallback = false;
	if (confirmation.data.courseId) {
		const courseResult = await fetchCourseDetail(fetch, confirmation.data.courseId, {
			token: locals.accessToken ?? undefined
		});
		course = courseResult.data ?? null;
		courseUsedFallback = courseResult.error?.code === 'MOCK_DATA';
	}

	return {
		orderNumber,
		confirmation: confirmation.data,
		course,
		usedFallback: confirmation.error?.code === 'MOCK_DATA' || courseUsedFallback
	};
};
