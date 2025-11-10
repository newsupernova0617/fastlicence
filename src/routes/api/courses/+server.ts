import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { CourseListResponse, CourseSummary, DifficultyLevel } from '$lib/types';
import { getMockCourses } from '$lib/mocks/courses';

/**
 * GET /api/courses
 * 강의 목록 조회 (필터/검색/정렬 지원)
 *
 * Query params:
 * - search: string (제목/강사명 검색)
 * - difficulty: DifficultyLevel | 'all'
 * - sort: 'latest' | 'popular' | 'priceAsc' | 'priceDesc'
 * - cursor: string (pagination)
 * - limit: number (default: 20)
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		// Query params 파싱
		const search = url.searchParams.get('search');
		const difficulty = url.searchParams.get('difficulty') as DifficultyLevel | 'all' | null;
		const sort = url.searchParams.get('sort');
		const cursor = url.searchParams.get('cursor');
		const limit = parseInt(url.searchParams.get('limit') ?? '20', 10);

		// TODO: Supabase 연동
		// const { data, error } = await supabase
		//   .from('courses')
		//   .select('*')
		//   .eq('is_active', true)
		//   .ilike('title', search ? `%${search}%` : '%')
		//   .limit(limit);

		// 임시: 목업 데이터 반환
		const normalizeSortParam = (
			value: string | null
		): 'popular' | 'latest' | 'priceAsc' | 'priceDesc' => {
			switch (value) {
				case 'latest':
				case 'newest':
					return 'latest';
				case 'priceAsc':
				case 'price_low':
					return 'priceAsc';
				case 'priceDesc':
				case 'price_high':
					return 'priceDesc';
				default:
					return 'popular';
			}
		};

		const sortParam = normalizeSortParam(sort);
		const mockCourses = getMockCourses();

		// 검색어 필터 (목업 데이터에 적용)
		let filteredCourses = mockCourses;
		if (search) {
			const searchLower = search.toLowerCase();
			filteredCourses = filteredCourses.filter(
				(course) =>
					course.title.toLowerCase().includes(searchLower) ||
					course.instructor.toLowerCase().includes(searchLower)
			);
		}

		// 난이도 필터
		if (difficulty && difficulty !== 'all') {
			filteredCourses = filteredCourses.filter((course) => course.difficulty === difficulty);
		}

		// 정렬
		const priceValue = (course: CourseSummary) => course.salePrice ?? course.originalPrice;
		const publishedAtValue = (course: CourseSummary) =>
			course.publishedAt ? Date.parse(course.publishedAt) : 0;
		const popularityScore = (course: CourseSummary) => course.reviewCount ?? 0;

		if (sortParam === 'priceAsc') {
			filteredCourses.sort((a, b) => priceValue(a) - priceValue(b));
		} else if (sortParam === 'priceDesc') {
			filteredCourses.sort((a, b) => priceValue(b) - priceValue(a));
		} else if (sortParam === 'latest') {
			filteredCourses.sort((a, b) => publishedAtValue(b) - publishedAtValue(a));
		} else {
			filteredCourses.sort((a, b) => popularityScore(b) - popularityScore(a));
		}

		const limitedCourses = filteredCourses.slice(0, limit);
		const hasMore = filteredCourses.length > limit;

		const response: CourseListResponse = {
			items: limitedCourses,
			nextCursor: hasMore ? `cursor_${Date.now()}` : null
		};

		return json(response);
	} catch (error) {
		console.error('Error fetching courses:', error);
		return json(
			{
				error: {
					code: 'INTERNAL_ERROR',
					message: '강의 목록을 불러오는 중 오류가 발생했습니다.'
				}
			},
			{ status: 500 }
		);
	}
};
