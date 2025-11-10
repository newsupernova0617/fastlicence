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
import { getMockCourseDetail, getMockCourses } from '$lib/mocks/courses';
import { confirmMockPayment, createMockOrder } from '$lib/mocks/orders';
import { getMockMyPage, updateMockProfile } from '$lib/mocks/profile';
import {
	addMockNote,
	addMockQuestion,
	getMockLearningLecture,
	updateMockProgress
} from '$lib/mocks/learning';

type ApiFetchOptions = {
	token?: string;
	method?: string;
	body?: unknown;
	headers?: Record<string, string>;
};

export const apiFetch = async <T>(
	fetchFn: typeof fetch,
	path: string,
	{ token, method = 'GET', body, headers }: ApiFetchOptions = {}
): Promise<ApiResponse<T>> => {
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
		const response = await fetchFn(path, requestInit);
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

export const fetchCourses = async (
	fetchFn: typeof fetch,
	params: FetchCoursesParams = {}
): Promise<ApiResponse<CourseListResponse>> => {
	const { search, difficulty, sort, cursor, limit, token } = params;
	const query = new URLSearchParams();

	if (search) query.set('search', search);
	if (difficulty && difficulty !== 'all') query.set('difficulty', difficulty);
	if (sort) query.set('sort', sort);
	if (cursor) query.set('cursor', cursor);
	if (limit) query.set('limit', String(limit));

	const path = query.toString() ? `/api/courses?${query.toString()}` : '/api/courses';
	const result = await apiFetch<CourseListResponse>(fetchFn, path, { token });

	if (!result.data) {
		return {
			data: { items: getMockCourses(limit), nextCursor: null },
			error: result.error ?? {
				code: 'MOCK_DATA',
				message: '목업 데이터를 사용했습니다.'
			}
		};
	}

	return result;
};

export const fetchCourseDetail = async (
	fetchFn: typeof fetch,
	courseId: string,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<CourseDetail>> => {
	const path = `/api/courses/${courseId}`;
	const result = await apiFetch<CourseDetail>(fetchFn, path, { token });

	if (!result.data) {
		const fallback = getMockCourseDetail(courseId);
		return {
			data: fallback,
			error: result.error ?? {
				code: 'MOCK_DATA',
				message: '목업 데이터를 사용했습니다.'
			}
		};
	}

	return result;
};

export const fetchMyPage = async (
	fetchFn: typeof fetch,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<MyPageData>> => {
	const result = await apiFetch<MyPageData>(fetchFn, '/api/me', { token });

	if (!result.data) {
		return {
			data: getMockMyPage(),
			error: result.error ?? {
				code: 'MOCK_DATA',
				message: '마이페이지 데이터를 목업으로 불러왔습니다.'
			}
		};
	}

	return result;
};

type UpdateProfilePayload = Partial<Pick<UserProfile, 'nickname' | 'address' | 'avatarUrl'>>;

export const updateProfile = async (
	fetchFn: typeof fetch,
	payload: UpdateProfilePayload,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<UserProfile>> => {
	const result = await apiFetch<UserProfile>(fetchFn, '/api/me/profile', {
		method: 'PATCH',
		body: payload,
		token
	});

	if (!result.data) {
		return {
			data: updateMockProfile(payload),
			error: result.error ?? {
				code: 'MOCK_DATA',
				message: '프로필을 임시로 업데이트했습니다.'
			}
		};
	}

	return result;
};

export const fetchLearningLecture = async (
	fetchFn: typeof fetch,
	lectureId: string,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<LearningLectureData>> => {
	const result = await apiFetch<LearningLectureData>(
		fetchFn,
		`/api/learning/lecture/${lectureId}`,
		{ token }
	);

	if (!result.data) {
		return {
			data: getMockLearningLecture(lectureId),
			error: result.error ?? {
				code: 'MOCK_DATA',
				message: '학습 데이터를 목업으로 불러왔습니다.'
			}
		};
	}

	return result;
};

export const saveLearningProgress = async (
	fetchFn: typeof fetch,
	progress: LectureProgress,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<LectureProgress>> => {
	const result = await apiFetch<LectureProgress>(fetchFn, '/api/learning/progress', {
		method: 'POST',
		body: progress,
		token
	});

	if (!result.data) {
		return {
			data: updateMockProgress(progress.lectureId, progress),
			error: result.error ?? {
				code: 'MOCK_DATA',
				message: '진행률 저장을 목업으로 처리했습니다.'
			}
		};
	}

	return result;
};

export const saveLearningNote = async (
	fetchFn: typeof fetch,
	payload: NotePayload,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<NoteEntry>> => {
	const result = await apiFetch<NoteEntry>(fetchFn, '/api/learning/notes', {
		method: 'POST',
		body: payload,
		token
	});

	if (!result.data) {
		return {
			data: addMockNote(payload),
			error: result.error ?? {
				code: 'MOCK_DATA',
				message: '메모 저장을 목업으로 처리했습니다.'
			}
		};
	}

	return result;
};

export const submitLearningQuestion = async (
	fetchFn: typeof fetch,
	lectureId: string,
	question: string,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<NoteEntry>> => {
	const result = await apiFetch<NoteEntry>(
		fetchFn,
		'/functions/v1/learning/answerQuestion',
		{ method: 'POST', body: { lectureId, question }, token }
	);

	if (!result.data) {
		return {
			data: addMockQuestion(lectureId, question),
			error: result.error ?? {
				code: 'MOCK_DATA',
				message: '질문 전송을 목업으로 처리했습니다.'
			}
		};
	}

	return result;
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
	const result = await apiFetch<CreateOrderResponse>(
		fetchFn,
		'/functions/v1/payments/createOrder',
		{ method: 'POST', body: payload, token }
	);

	if (!result.data) {
		return {
			data: createMockOrder(payload.courseId, payload.provider),
			error: result.error ?? {
				code: 'MOCK_DATA',
				message: '결제 생성을 목업 데이터로 처리했습니다.'
			}
		};
	}

	return result;
};

type ConfirmPaymentPayload = {
	orderNumber: string;
};

export const confirmPayment = async (
	fetchFn: typeof fetch,
	payload: ConfirmPaymentPayload,
	{ token }: { token?: string } = {}
): Promise<ApiResponse<PaymentConfirmation>> => {
	const result = await apiFetch<PaymentConfirmation>(
		fetchFn,
		'/functions/v1/payments/confirmPayment',
		{ method: 'POST', body: payload, token }
	);

	if (!result.data) {
		return {
			data: confirmMockPayment(payload.orderNumber),
			error: result.error ?? {
				code: 'MOCK_DATA',
				message: '결제 확인을 목업 데이터로 처리했습니다.'
			}
		};
	}

	return result;
};
