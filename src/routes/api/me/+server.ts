import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { MyPageData } from '$lib/types';
import { getMockMyPage } from '$lib/mocks/profile';

/**
 * GET /api/me
 * 마이페이지 데이터 조회
 *
 * Returns:
 * - profile: UserProfile (닉네임, 이메일, 아바타, 주소)
 * - courses: UserCourseSummary[] (수강 중인 강의 + 진행률)
 *
 * Requires: Authentication
 */
export const GET: RequestHandler = async ({ locals }) => {
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

		// TODO: Supabase 연동
		// const { data: profile, error: profileError } = await supabase
		//   .from('users')
		//   .select('*')
		//   .eq('id', user.id)
		//   .single();

		// const { data: courses, error: coursesError } = await supabase
		//   .from('user_course_access')
		//   .select(`
		//     course_id,
		//     progress_percent,
		//     courses (
		//       id,
		//       title,
		//       thumbnail_url
		//     )
		//   `)
		//   .eq('user_id', user.id)
		//   .eq('status', 'active');

		// 임시: 목업 데이터 반환
		const mockData = getMockMyPage();

		// 실제 사용자 정보로 프로필 덮어쓰기
		const myPageData: MyPageData = {
			profile: {
				id: user.id,
				email: user.email,
				nickname: user.nickname ?? user.email.split('@')[0],
				avatarUrl: user.avatarUrl ?? null,
				address: mockData.profile.address // 주소는 DB에서 가져와야 함
			},
			courses: mockData.courses
		};

		return json(myPageData);
	} catch (error) {
		console.error('Error fetching my page data:', error);
		return json(
			{
				error: {
					code: 'INTERNAL_ERROR',
					message: '마이페이지 데이터를 불러오는 중 오류가 발생했습니다.'
				}
			},
			{ status: 500 }
		);
	}
};
