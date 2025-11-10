import type { LearningLectureData, LectureProgress, NoteEntry, NotePayload } from '$lib/types';

const lectureMap: Record<string, LearningLectureData> = {};

const allSiblings = [
	{ id: 'course-ai-accelerator-lecture-1', title: '오리엔테이션 및 합격 전략', durationMinutes: 18, previewAvailable: true },
	{ id: 'course-ai-accelerator-lecture-2', title: '필수 개념 정리 1', durationMinutes: 32, previewAvailable: true },
	{ id: 'course-ai-accelerator-lecture-3', title: '실전 CBT 모의고사 해설', durationMinutes: 45, previewAvailable: true }
];

const lectureMetadata: Record<string, { title: string; durationMinutes: number; description: string }> = {
	'course-ai-accelerator-lecture-1': {
		title: '오리엔테이션 및 합격 전략',
		durationMinutes: 18,
		description: '강의 흐름과 합격 전략을 소개합니다.'
	},
	'course-ai-accelerator-lecture-2': {
		title: '필수 개념 정리 1',
		durationMinutes: 32,
		description: '필수 개념들을 체계적으로 정리합니다.'
	},
	'course-ai-accelerator-lecture-3': {
		title: '실전 CBT 모의고사 해설',
		durationMinutes: 45,
		description: '실전 모의고사 문제들을 상세히 해설합니다.'
	}
};

const createBaseLecture = (lectureId: string): LearningLectureData => {
	const courseId = 'course-ai-accelerator';
	const metadata = lectureMetadata[lectureId] || {
		title: '강의',
		durationMinutes: 30,
		description: '강의 설명입니다.'
	};

	return {
		lecture: {
			id: lectureId,
			title: metadata.title,
			durationMinutes: metadata.durationMinutes,
			videoUrl: 'https://storage.googleapis.com/fastsaas/videos/sample.mp4',
			description: metadata.description,
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
		siblings: allSiblings,
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
