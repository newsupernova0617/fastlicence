import type { DifficultyLevel, LectureSummary } from '$lib/types';

export const formatCurrency = (value: number): string =>
	new Intl.NumberFormat('ko-KR', {
		style: 'currency',
		currency: 'KRW',
		maximumFractionDigits: 0
	}).format(value);

export const formatDifficulty = (difficulty: DifficultyLevel): string => {
	switch (difficulty) {
		case 'beginner':
			return '초급';
		case 'intermediate':
			return '중급';
		case 'advanced':
			return '고급';
		default:
			return difficulty;
	}
};

export const formatDuration = (lecture: LectureSummary): string => {
	const minutes = lecture.durationMinutes ?? 0;
	if (minutes < 60) {
		return `${minutes}분`;
	}
	const hours = Math.floor(minutes / 60);
	const remaining = minutes % 60;
	return remaining === 0 ? `${hours}시간` : `${hours}시간 ${remaining}분`;
};
