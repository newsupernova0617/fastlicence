import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { LectureProgress } from '$lib/types';
import { updateMockProgress } from '$lib/mocks/learning';

/**
 * POST /api/learning/progress
 * 학습 진행률 저장
 *
 * Request body:
 * - lectureId: string
 * - secondsWatched: number
 * - percent: number (0-100)
 *
 * Returns:
 * - LectureProgress (저장된 진행률)
 *
 * Requires: Authentication
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const user = locals.user;

		if (!user) {
			return json(
				{
					error: {
						code: 'UNAUTHORIZED',
						message: '로그인이 필요합니다.'
					}
				},
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { lectureId, secondsWatched, percent } = body as LectureProgress;

		// 유효성 검사
		if (!lectureId || typeof secondsWatched !== 'number' || typeof percent !== 'number') {
			return json(
				{
					error: {
						code: 'VALIDATION_ERROR',
						message: 'lectureId, secondsWatched, percent가 필요합니다.'
					}
				},
				{ status: 400 }
			);
		}

		if (percent < 0 || percent > 100) {
			return json(
				{
					error: {
						code: 'VALIDATION_ERROR',
						message: 'percent는 0-100 사이의 값이어야 합니다.'
					}
				},
				{ status: 400 }
			);
		}

		// TODO: Supabase 연동
		// 1. 수강권 확인 (해당 강의의 course_id를 통해)
		// const { data: lecture } = await supabase
		//   .from('lectures')
		//   .select('course_id')
		//   .eq('id', lectureId)
		//   .single();

		// const { data: access } = await supabase
		//   .from('user_course_access')
		//   .select('status')
		//   .eq('user_id', user.id)
		//   .eq('course_id', lecture.course_id)
		//   .eq('status', 'active')
		//   .maybeSingle();

		// if (!access) {
		//   return json({ error: { code: 'FORBIDDEN', message: '수강권이 없습니다.' } }, { status: 403 });
		// }

		// 2. lecture_progress upsert
		// const { data, error } = await supabase
		//   .from('lecture_progress')
		//   .upsert({
		//     user_id: user.id,
		//     lecture_id: lectureId,
		//     last_watched_second: secondsWatched,
		//     completed: percent >= 90,
		//     updated_at: new Date().toISOString()
		//   }, {
		//     onConflict: 'user_id,lecture_id'
		//   })
		//   .select()
		//   .single();

		// 임시: 목업 데이터 업데이트
		const updatedProgress = updateMockProgress(lectureId, {
			lectureId,
			secondsWatched,
			percent
		});

		return json(updatedProgress);
	} catch (error) {
		console.error('Error saving progress:', error);
		return json(
			{
				error: {
					code: 'INTERNAL_ERROR',
					message: '진행률 저장 중 오류가 발생했습니다.'
				}
			},
			{ status: 500 }
		);
	}
};
