import type { LearningLectureData, LectureProgress, NoteEntry, NotePayload } from '$lib/types';

const lectureMap: Record<string, LearningLectureData> = {};

const createBaseLecture = (lectureId: string): LearningLectureData => {
	const courseId = 'course-ai-accelerator';
	return {
		lecture: {
			id: lectureId,
			title: '오리엔테이션 및 합격 전략',
			durationMinutes: 18,
			videoUrl: 'https://storage.googleapis.com/fastsaas/videos/sample.mp4',
			description: '강의 흐름과 합격 전략을 소개합니다.',
			previewAvailable: true
		},
		course: {
			id: courseId,
			title: 'AI 합격 마스터: 산업기사 단기 완성'
		},
		notes: [
			{
				noteId: 1,
				lectureId,
				noteType: 'auto_summary',
				content: '핵심 키워드와 학습 순서를 정리한 자동 요약입니다.',
				createdAt: new Date().toISOString()
			}
		] satisfies NoteEntry[],
		progress: {
			lectureId,
			secondsWatched: 240,
			percent: 35
		} satisfies LectureProgress,
		siblings: [
			{ id: lectureId, title: '오리엔테이션 및 합격 전략', durationMinutes: 18, previewAvailable: true },
			{ id: `${courseId}-lecture-2`, title: '필수 개념 정리 1', durationMinutes: 32 },
			{ id: `${courseId}-lecture-3`, title: '실전 CBT 모의고사 해설', durationMinutes: 45 }
		],
		hasAccess: true
	};
};

export const getMockLearningLecture = (lectureId: string): LearningLectureData => {
	if (!lectureMap[lectureId]) {
		lectureMap[lectureId] = createBaseLecture(lectureId);
	}
	return structuredClone(lectureMap[lectureId]);
};

export const updateMockProgress = (lectureId: string, progress: LectureProgress): LectureProgress => {
	const data = getMockLearningLecture(lectureId);
	data.progress = progress;
	lectureMap[lectureId] = data;
	return structuredClone(progress);
};

let noteSequence = 1000;

export const addMockNote = (payload: NotePayload): NoteEntry => {
	const data = getMockLearningLecture(payload.lectureId);
	const note: NoteEntry = {
		noteId: ++noteSequence,
		lectureId: payload.lectureId,
		noteType: payload.noteType,
		question: payload.question ?? null,
		content: payload.content,
		createdAt: new Date().toISOString()
	};
	data.notes = [note, ...data.notes];
	lectureMap[payload.lectureId] = data;
	return structuredClone(note);
};

export const addMockQuestion = (lectureId: string, question: string): NoteEntry => {
	return addMockNote({
		lectureId,
		noteType: 'qa_answer',
		question,
		content: '답변 준비 중입니다. 담당 튜터가 곧 답변을 등록할 예정입니다.'
	});
};
