import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { NoteEntry, NotePayload } from '$lib/types';
import { addMockNote } from '$lib/mocks/learning';

/**
 * POST /api/learning/notes
 * 학습 노트 저장 (사용자 메모)
 *
 * Request body:
 * - lectureId: string
 * - noteType: 'user_memo' | 'auto_summary' | 'qa_answer'
 * - content: string
 * - question?: string (qa_answer일 때만)
 *
 * Returns:
 * - NoteEntry (저장된 노트)
 *
 * Requires: Authentication
 *
 * Note: 자동 요약과 Q&A는 별도 Edge Function (/functions/v1/learning/...)으로 처리
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

		const body = (await request.json()) as NotePayload;
		const { lectureId, noteType, content, question } = body;

		// 유효성 검사
		if (!lectureId || !noteType || !content) {
			return json(
				{
					error: {
						code: 'VALIDATION_ERROR',
						message: 'lectureId, noteType, content가 필요합니다.'
					}
				},
				{ status: 400 }
			);
		}

		if (!['user_memo', 'auto_summary', 'qa_answer'].includes(noteType)) {
			return json(
				{
					error: {
						code: 'VALIDATION_ERROR',
						message: 'noteType은 user_memo, auto_summary, qa_answer 중 하나여야 합니다.'
					}
				},
				{ status: 400 }
			);
		}

		// TODO: Supabase 연동
		// 1. 수강권 확인
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

		// 2. notes insert
		// const { data, error } = await supabase
		//   .from('notes')
		//   .insert({
		//     user_id: user.id,
		//     lecture_id: lectureId,
		//     note_type: noteType,
		//     content,
		//     question: question ?? null,
		//     created_at: new Date().toISOString()
		//   })
		//   .select()
		//   .single();

		// 임시: 목업 데이터 추가
		const newNote = addMockNote({
			lectureId,
			noteType,
			content,
			question
		});

		return json(newNote);
	} catch (error) {
		console.error('Error saving note:', error);
		return json(
			{
				error: {
					code: 'INTERNAL_ERROR',
					message: '노트 저장 중 오류가 발생했습니다.'
				}
			},
			{ status: 500 }
		);
	}
};
