import { SvelteComponent } from 'svelte';
import type { CourseSummary } from '$lib/types';

export interface CourseCardProps {
	course: CourseSummary;
	href?: string | null;
}

export default class CourseCard extends SvelteComponent<CourseCardProps> {}
