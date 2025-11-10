import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { LearningLectureData } from '$lib/types';
import { getMockLearningLecture } from '$lib/mocks/learning';

/**
 * GET /api/learning/lecture/:lectureId
 * 학습 페이지 데이터 조회
 *
 * Returns:
 * - lecture: { videoUrl, title, description, ... }
 * - course: { id, title }
 * - notes: NoteEntry[] (자동 요약, 메모, Q&A)
 * - progress: LectureProgress | null (진행률)
 * - siblings: LectureSummary[] (같은 코스의 다른 강의)
 * - hasAccess: boolean (수강권 여부)
 *
 * Requires: Authentication
 * Access control: 수강권이 없으면 403
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		const { lectureId } = params;
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
		// 1. lecture 정보 조회 (+ course_id)
		// const { data: lecture, error: lectureError } = await supabase
		//   .from('lectures')
		//   .select('*, courses!inner(id, title)')
		//   .eq('id', lectureId)
		//   .single();

		// 2. 수강권 확인
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

		// 3. Storage에서 signed URL 생성
		// const { data: signedUrl } = await supabase.storage
		//   .from('videos')
		//   .createSignedUrl(lecture.video_path, 60 * 60); // 1시간 만료

		// 4. 노트 조회
		// const { data: notes } = await supabase
		//   .from('notes')
		//   .select('*')
		//   .eq('user_id', user.id)
		//   .eq('lecture_id', lectureId)
		//   .order('created_at', { ascending: false });

		// 5. 진행률 조회
		// const { data: progress } = await supabase
		//   .from('lecture_progress')
		//   .select('*')
		//   .eq('user_id', user.id)
		//   .eq('lecture_id', lectureId)
		//   .maybeSingle();

		// 6. 같은 코스의 다른 강의들
		// const { data: siblings } = await supabase
		//   .from('lectures')
		//   .select('id, title, duration_minutes, preview_available')
		//   .eq('course_id', lecture.course_id)
		//   .order('order_index', { ascending: true });

		// 임시: 목업 데이터 반환
		const mockData = getMockLearningLecture(lectureId);

		// hasAccess는 임시로 true (실제로는 수강권 확인 필요)
		const learningData: LearningLectureData = {
			...mockData,
			hasAccess: true // TODO: 실제 수강권 확인 로직
		};

		return json(learningData);
	} catch (error) {
		console.error('Error fetching learning lecture:', error);
		return json(
			{
				error: {
					code: 'INTERNAL_ERROR',
					message: '학습 데이터를 불러오는 중 오류가 발생했습니다.'
				}
			},
			{ status: 500 }
		);
	}
};
