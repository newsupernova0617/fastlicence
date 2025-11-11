import type {
	ApiResponse,
	CourseDetail,
	CourseListResponse,
	CourseSummary,
	CreateOrderResponse,
	DifficultyLevel,
	LearningLectureData,
	LectureProgress,
	MyPageData,
	NoteEntry,
	NotePayload,
	PaymentConfirmation,
	PaymentProvider,
	UserProfile
} from '$lib/types';
import { env } from '$env/dynamic/public';

type ApiFetchOptions = {
	token?: string;
	method?: string;
	body?: unknown;
	headers?: Record<string, string>;
};

const API_BASE_URL = env.PUBLIC_API_URL?.replace(/\/+$/, '') ?? '';
const FUNCTIONS_BASE_URL = env.PUBLIC_FUNCTIONS_URL
	? env.PUBLIC_FUNCTIONS_URL.replace(/\/+$/, '')
	: API_BASE_URL.replace(/\/api\/?$/, '');

const buildUrl = (path: string): string => {
	if (/^https?:\/\//.test(path)) {
		return path;
	}

	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	if (normalizedPath.startsWith('/functions/v1/')) {
		return `${FUNCTIONS_BASE_URL}${normalizedPath}`;
	}

	if (API_BASE_URL) {
		return `${API_BASE_URL}${normalizedPath}`;
	}

	return normalizedPath;
};

export const apiFetch = async <T>(
	fetchFn: typeof fetch,
	path: string,
	{ token, method = 'GET', body, headers }: ApiFetchOptions = {}
): Promise<ApiResponse<T>> => {
	const url = buildUrl(path);
	if (import.meta.env.DEV) {
		console.debug('[apiFetch] request', { method, url });
	}
	const requestInit: RequestInit = {
		method,
		headers: {
			'Content-Type': 'application/json',
			...(headers ?? {}),
			...(token ? { Authorization: `Bearer ${token}` } : {})
		}
	};

	if (body !== undefined) {
		requestInit.body = JSON.stringify(body);
	}

	try {
		const response = await fetchFn(url, requestInit);
		if (import.meta.env.DEV) {
			console.debug('[apiFetch] response', { method, url, status: response.status });
		}
		if (!response.ok) {
			const errorBody = await response.json().catch(() => null);
			return {
				data: null,
				error: {
					code: errorBody?.error?.code ?? `HTTP_${response.status}`,
					message: errorBody?.error?.message ?? '요청을 처리하는 중 오류가 발생했습니다.'
				}
			};
		}

		const result = (await response.json()) as T;
		return { data: result };
	} catch (error) {
		const message = error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.';
		return {
			data: null,
			error: {
				code: 'NETWORK_ERROR',
				message
			}
		};
	}
};

type FetchCoursesParams = {
	search?: string | null;
	difficulty?: DifficultyLevel | 'all' | null;
	sort?: string | null;
	cursor?: string | null;
	limit?: number;
	token?: string;
};

type BackendCourse = {
	courseId: number;
	title: string;
	instructorName: string;
	priceOriginal: number;
	priceSale: number | null;
	tags?: string[] | null;
	thumbnailUrl?: string | null;
	difficultyLevel?: 'beginner' | 'mid' | 'advanced' | null;
	summaryText?: string | null;
};

type BackendCourseListResponse = {
	pagination: {
		page: number;
		size: number;
		total: number;
	};
	courses: BackendCourse[];
};

type BackendCourseDetailResponse = {
	course: BackendCourse & {
		hasAccess: boolean;
		progressPercent?: number | null;
		difficultyLevel?: 'beginner' | 'mid' | 'advanced' | null;
	};
	lectures: {
		lectureId: number;
		title: string;
		durationSeconds: number;
		orderIndex: number;
		previewAvailable: boolean;
	}[];
};

type BackendMyPageResponse = {
	profile: {
		id: string;
		nickname: string;
		email: string;
		avatar_url?: string | null;
	};
	enrollments: {
		courseId: string;
		title: string;
		thumbnail?: string | null;
		progress?: number | null;
	}[];
};

type BackendUserProfile = {
	id: string;
	email: string;
	nickname: string;
	profile_image_url?: string | null;
	address_text?: string | null;
};

const formatDifficulty = (value?: string | null): DifficultyLevel => {
	if (value === 'advanced') return 'advanced';
	if (value === 'mid') return 'intermediate';
	return 'beginner';
};

const mapCourseSummary = (course: BackendCourse): CourseSummary => ({
	id: String(course.courseId),
	title: course.title,
	description: course.summaryText ?? null,
	publishedAt: null,
	thumbnailUrl: course.thumbnailUrl ?? null,
	instructor: course.instructorName,
	difficulty: formatDifficulty(course.difficultyLevel),
	reviewCount: null,
	originalPrice: course.priceOriginal,
	salePrice: course.priceSale ?? null,
	tags: course.tags ?? undefined
});

const toCourseListResponse = (payload: BackendCourseListResponse): CourseListResponse => {
	const totalPages = Math.ceil(payload.pagination.total / payload.pagination.size);
	const nextPage =
		payload.pagination.page < totalPages ? String(payload.pagination.page + 1) : null;

	return {
		items: payload.courses.map(mapCourseSummary),
		nextCursor: nextPage
	};
};

export const fetchCourses = async (
	fetchFn: typeof fetch,
	params: FetchCoursesParams = {}
): Promise<ApiResponse<CourseListResponse>> => {
	const { search, difficulty, sort, cursor, limit, token } = params;
	const query = new URLSearchParams();
	const page = cursor ? Number(cursor) : 1;

	if (search) query.set('search', search);
	if (difficulty && difficulty !== 'all') query.set('difficulty', difficulty);
	if (sort) query.set('sort', sort);
	if (limit) query.set('size', String(limit));
	if (page && page > 1) query.set('page', String(page));

	const path = query.toString() ? `/api/courses?${query.toString()}` : '/api/courses';
	const result = await apiFetch<BackendCourseListResponse>(fetchFn, path, { token });

	if (!result.data) {
		return { data: null, error: result.error };
	}

	return {
		data: toCourseListResponse(result.data),
		error: result.error
	};
};

export const fetchCourseDetail = async (
	fetchFn: typeof fetch,
	courseId: string,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<CourseDetail>> => {
	const path = `/api/courses/${courseId}`;
	const result = await apiFetch<BackendCourseDetailResponse>(fetchFn, path, { token });

	if (!result.data) {
		return { data: null, error: result.error };
	}

	const { course, lectures } = result.data;
	const mappedCourse = mapCourseSummary(course);

	const detail: CourseDetail = {
		...mappedCourse,
		hasAccess: course.hasAccess,
		lectures: lectures.map((lecture) => ({
			id: String(lecture.lectureId),
			title: lecture.title,
			durationMinutes: lecture.durationSeconds ? lecture.durationSeconds / 60 : null,
			previewAvailable: lecture.previewAvailable
		}))
	};

	return { data: detail, error: result.error };
};

export const fetchMyPage = async (
	fetchFn: typeof fetch,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<MyPageData>> => {
	const result = await apiFetch<BackendMyPageResponse>(fetchFn, '/get-mypage', { token });

	if (!result.data) {
		return { data: null, error: result.error };
	}

	return {
		data: {
			profile: {
				id: result.data.profile.id,
				nickname: result.data.profile.nickname,
				email: result.data.profile.email,
				avatarUrl: result.data.profile.avatar_url ?? null,
				address: null
			},
			courses: result.data.enrollments.map((enrollment) => ({
				courseId: enrollment.courseId,
				title: enrollment.title,
				thumbnailUrl: enrollment.thumbnail ?? null,
				progressPercent: enrollment.progress ?? 0
			}))
		},
		error: result.error
	};
};

type UpdateProfilePayload = Partial<Pick<UserProfile, 'nickname' | 'address' | 'avatarUrl'>>;

export const updateProfile = async (
	fetchFn: typeof fetch,
	payload: UpdateProfilePayload,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<UserProfile>> => {
	const result = await apiFetch<{ user: BackendUserProfile }>(fetchFn, '/api/me/profile', {
		method: 'PATCH',
		body: payload,
		token
	});

	if (!result.data?.user) {
		return { data: null, error: result.error };
	}

	const user = result.data.user;
	return {
		data: {
			id: user.id,
			email: user.email,
			nickname: user.nickname,
			avatarUrl: user.profile_image_url ?? null,
			address: user.address_text ?? null
		},
		error: result.error
	};
};

export const fetchLearningLecture = async (
	fetchFn: typeof fetch,
	lectureId: string,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<LearningLectureData>> => {
	const path = `/api/learning/lecture/${lectureId}`;
	const result = await apiFetch<LearningLectureData>(fetchFn, path, { token });

	if (!result.data) {
		return { data: null, error: result.error };
	}

	return result;
};

export const saveLearningProgress = async (
	fetchFn: typeof fetch,
	progress: LectureProgress,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<LectureProgress>> => {
	return apiFetch<LectureProgress>(fetchFn, '/api/learning/progress', {
		method: 'POST',
		body: progress,
		token
	});
};

export const saveLearningNote = async (
	fetchFn: typeof fetch,
	payload: NotePayload,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<NoteEntry>> => {
	return apiFetch<NoteEntry>(fetchFn, '/api/learning/notes', {
		method: 'POST',
		body: payload,
		token
	});
};

export const submitLearningQuestion = async (
	fetchFn: typeof fetch,
	lectureId: string,
	question: string,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<NoteEntry>> => {
	return apiFetch<NoteEntry>(
		fetchFn,
		'/functions/v1/learning/answerQuestion',
		{ method: 'POST', body: { lectureId, question }, token }
	);
};

type CreateOrderPayload = {
	courseId: string;
	provider: PaymentProvider;
};

export const createOrder = async (
	fetchFn: typeof fetch,
	payload: CreateOrderPayload,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<CreateOrderResponse>> => {
	return apiFetch<CreateOrderResponse>(
		fetchFn,
		'/functions/v1/payments/createOrder',
		{ method: 'POST', body: payload, token }
	);
};

type ConfirmPaymentPayload = {
	orderNumber: string;
};

export const confirmPayment = async (
	fetchFn: typeof fetch,
	payload: ConfirmPaymentPayload,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<PaymentConfirmation>> => {
	return apiFetch<PaymentConfirmation>(
		fetchFn,
		'/functions/v1/payments/confirmPayment',
		{ method: 'POST', body: payload, token }
	);
};
