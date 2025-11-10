import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { CourseDetail } from '$lib/types';
import { getMockCourseDetail } from '$lib/mocks/courses';

/**
 * GET /api/courses/:courseId
 * 강의 상세 정보 조회
 *
 * Returns:
 * - course: CourseDetail (강의 정보 + 커리큘럼)
 * - hasAccess: boolean (현재 유저의 수강권 여부)
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		const { courseId } = params;
		const user = locals.user;

		// TODO: Supabase 연동
		// const { data: course, error } = await supabase
		//   .from('courses')
		//   .select(`
		//     *,
		//     lectures (*)
		//   `)
		//   .eq('id', courseId)
		//   .single();

		// TODO: 수강권 확인
		// const { data: access } = await supabase
		//   .from('user_course_access')
		//   .select('status')
		//   .eq('user_id', user?.id)
		//   .eq('course_id', courseId)
		//   .eq('status', 'active')
		//   .maybeSingle();

		// 임시: 목업 데이터 반환
		const mockCourse = getMockCourseDetail(courseId);

		if (!mockCourse) {
			return json(
				{
					error: {
						code: 'NOT_FOUND',
						message: '요청하신 강의를 찾을 수 없습니다.'
					}
				},
				{ status: 404 }
			);
		}

		// hasAccess는 로그인 유저가 있을 때만 체크 (목업에서는 항상 false)
		const courseDetail: CourseDetail = {
			...mockCourse,
			hasAccess: false // TODO: 실제 수강권 확인 로직으로 대체
		};

		return json(courseDetail);
	} catch (error) {
		console.error('Error fetching course detail:', error);
		return json(
			{
				error: {
					code: 'INTERNAL_ERROR',
					message: '강의 정보를 불러오는 중 오류가 발생했습니다.'
				}
			},
			{ status: 500 }
		);
	}
};
