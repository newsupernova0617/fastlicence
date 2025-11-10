import { SvelteComponent } from 'svelte';
import type { CourseDetail } from '$lib/types';

export interface CheckoutFormProps {
	course: CourseDetail;
	disabled?: boolean;
}

export default class CheckoutForm extends SvelteComponent<CheckoutFormProps> {}
