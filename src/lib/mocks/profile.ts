import type { MyPageData, NoteEntry, UserProfile, UserCourseSummary } from '$lib/types';

const profile: UserProfile = {
	id: 'mock-user-1',
	nickname: '합격러',
	email: 'mockuser@example.com',
	avatarUrl: 'https://placehold.co/96x96?text=HK',
	address: '서울시 강남구'
};

const courses: UserCourseSummary[] = [
	{
		courseId: 'course-ai-accelerator',
		title: 'AI 합격 마스터: 산업기사 단기 완성',
		thumbnailUrl: 'https://placehold.co/300x200?text=AI',
		progressPercent: 72,
		lastLectureId: 'course-ai-accelerator-lecture-3',
		lastLectureTitle: '실전 CBT 모의고사 해설'
	},
	{
		courseId: 'course-security-foundation',
		title: '정보보안 기사 필수 개념 30일 완성',
		thumbnailUrl: 'https://placehold.co/300x200?text=Security',
		progressPercent: 38,
		lastLectureId: 'course-security-foundation-lecture-2',
		lastLectureTitle: '네트워크 보안 핵심 정리'
	}
];

export const mockMyPageData: MyPageData = {
	profile,
	courses
};

export const getMockMyPage = (): MyPageData => structuredClone(mockMyPageData);

export const updateMockProfile = (updates: Partial<UserProfile>): UserProfile => {
	Object.assign(profile, updates);
	return structuredClone(profile);
};
