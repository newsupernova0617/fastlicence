import type { CourseDetail, CourseSummary, LectureSummary } from '$lib/types';

export const mockCourses: CourseSummary[] = [
	{
		id: 'course-ai-accelerator',
		title: 'AI 합격 마스터: 산업기사 단기 완성',
		subtitle: '실전 문제 기반으로 4주 만에 합격을 목표로 합니다.',
		description: '필수 이론 정리와 실제 CBT 기출 분석으로 효율적인 학습을 제공합니다.',
		publishedAt: '2024-02-10T09:00:00Z',
		thumbnailUrl: 'https://placehold.co/600x400/1f2937/fff?text=AI+Master',
		instructor: '김데이터',
		difficulty: 'intermediate',
		lectureCount: 42,
		rating: 4.8,
		reviewCount: 312,
		originalPrice: 129000,
		salePrice: 89000,
		tags: ['AI', '자격증', 'CBT']
	},
	{
		id: 'course-cloud-pro',
		title: '클라우드 전문가(ADP) 실전 대비반',
		subtitle: '모의고사와 실무 사례로 합격률을 높여요.',
		description: '주요 Cloud 서비스 아키텍처를 한 번에 정리하고, 실무형 케이스 스터디를 제공합니다.',
		publishedAt: '2024-03-02T09:00:00Z',
		thumbnailUrl: 'https://placehold.co/600x400/2563eb/fff?text=Cloud+Pro',
		instructor: '이지은',
		difficulty: 'advanced',
		lectureCount: 58,
		rating: 4.9,
		reviewCount: 198,
		originalPrice: 179000,
		salePrice: 129000,
		tags: ['클라우드', 'DevOps']
	},
	{
		id: 'course-security-foundation',
		title: '정보보안 기사 필수 개념 30일 완성',
		subtitle: '기본 개념부터 자주 출제되는 문제까지 한 번에.',
		description: '공인 강사가 직접 정리한 핵심 개념과 암기 팁을 일일 학습 로드맵으로 제공합니다.',
		publishedAt: '2023-12-18T09:00:00Z',
		thumbnailUrl: 'https://placehold.co/600x400/7c3aed/fff?text=Security',
		instructor: '박시큐',
		difficulty: 'beginner',
		lectureCount: 36,
		rating: 4.7,
		reviewCount: 421,
		originalPrice: 99000,
		salePrice: 69000,
		tags: ['보안', '자격증']
	},
	{
		id: 'course-data-analytics',
		title: '데이터 분석 전문가 실무 프로젝트',
		subtitle: '합격 이후 현업에서 바로 쓰는 실무 케이스.',
		description: 'EDA부터 대시보드 구축까지 실전 Notion 템플릿과 함께 학습합니다.',
		publishedAt: '2024-01-25T09:00:00Z',
		thumbnailUrl: 'https://placehold.co/600x400/ea580c/fff?text=Analytics',
		instructor: '최인사이트',
		difficulty: 'intermediate',
		lectureCount: 48,
		rating: 4.6,
		reviewCount: 154,
		originalPrice: 149000,
		salePrice: 99000,
		tags: ['데이터', '실무']
	}
];

const defaultLectures: LectureSummary[] = [
	{ id: 'lec-1', title: '오리엔테이션 및 합격 전략', durationMinutes: 18, previewAvailable: true },
	{ id: 'lec-2', title: '필수 개념 정리 1', durationMinutes: 32 },
	{ id: 'lec-3', title: '실전 CBT 모의고사 해설', durationMinutes: 45 },
	{ id: 'lec-4', title: '오답 노트 작성법', durationMinutes: 27, previewAvailable: true }
];

export const mockCourseDetails: Record<string, CourseDetail> = mockCourses.reduce((acc, course) => {
	acc[course.id] = {
		...course,
		hasAccess: false,
		gptPreviewSummary:
			'주요 출제 포인트를 압축 정리하고, 시험 직전까지 활용 가능한 체크리스트를 제공합니다.',
		about:
			'합격률을 높이기 위한 고효율 학습 커리큘럼입니다. 매주 실전 모의고사와 피드백 세션을 통해 취약점을 보완합니다.',
		lectures: defaultLectures.map((lecture, index) => ({
			...lecture,
			id: `${course.id}-lecture-${index + 1}`
		}))
	};
	return acc;
}, {} as Record<string, CourseDetail>);

export const getMockCourses = (limit?: number): CourseSummary[] => {
	if (typeof limit === 'number') {
		return mockCourses.slice(0, limit);
	}
	return mockCourses;
};

export const getMockCourseDetail = (courseId: string): CourseDetail | null => {
	const existing = mockCourseDetails[courseId];
	if (existing) {
		return existing;
	}
	const fallback = mockCourses.find((course) => course.id === courseId);
	if (!fallback) {
		return null;
	}
	return {
		...fallback,
		hasAccess: false,
		gptPreviewSummary: null,
		about: fallback.description ?? null,
		lectures: defaultLectures.map((lecture, index) => ({
			...lecture,
			id: `${courseId}-lecture-${index + 1}`
		}))
	};
};
