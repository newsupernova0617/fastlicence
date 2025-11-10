export type UserSummary = {
	id: string;
	email: string;
	nickname?: string | null;
	avatarUrl?: string | null;
};

export type ApiError = {
	code: string;
	message: string;
};

export type ApiResponse<T> = {
	data: T | null;
	error?: ApiError;
};

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type CourseSummary = {
	id: string;
	title: string;
	subtitle?: string | null;
	description?: string | null;
	publishedAt?: string | null;
	thumbnailUrl?: string | null;
	instructor: string;
	difficulty: DifficultyLevel;
	lectureCount?: number;
	rating?: number | null;
	reviewCount?: number | null;
	originalPrice: number;
	salePrice?: number | null;
	tags?: string[];
};

export type LectureSummary = {
	id: string;
	title: string;
	durationMinutes?: number | null;
	previewAvailable?: boolean;
};

export type CourseDetail = CourseSummary & {
	gptPreviewSummary?: string | null;
	about?: string | null;
	hasAccess: boolean;
	lectures: LectureSummary[];
};

export type CourseListResponse = {
	items: CourseSummary[];
	nextCursor?: string | null;
};

export type PaymentProvider = 'kakaopay' | 'tosspay' | 'naverpay' | 'card';

export type CreateOrderResponse = {
	orderNumber: string;
	redirectUrl: string;
	courseId: string;
};

export type PaymentStatus = 'pending' | 'paid' | 'failed';

export type PaymentConfirmation = {
	status: PaymentStatus;
	courseId: string;
};

export type UserProfile = {
	id: string;
	nickname: string;
	email: string;
	avatarUrl?: string | null;
	address?: string | null;
};

export type UserCourseSummary = {
	courseId: string;
	title: string;
	thumbnailUrl?: string | null;
	progressPercent: number;
	lastLectureId?: string | null;
	lastLectureTitle?: string | null;
};

export type MyPageData = {
	profile: UserProfile;
	courses: UserCourseSummary[];
};

export type LectureProgress = {
	lectureId: string;
	secondsWatched: number;
	percent: number;
};

export type NoteType = 'user_memo' | 'auto_summary' | 'qa_answer';

export type NoteEntry = {
	noteId: number;
	lectureId: string;
	noteType: NoteType;
	question?: string | null;
	content: string;
	createdAt: string;
};

export type LearningLectureData = {
	lecture: LectureSummary & {
		videoUrl: string;
		description?: string | null;
	};
	course: {
		id: string;
		title: string;
	};
	notes: NoteEntry[];
	progress?: LectureProgress | null;
	siblings: LectureSummary[];
	hasAccess: boolean;
};

export type NotePayload = {
	lectureId: string;
	noteType: NoteType;
	content: string;
	question?: string | null;
};
