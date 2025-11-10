import type { UserSummary } from '$lib/types';

declare global {
	namespace App {
		interface Locals {
			user: UserSummary | null;
			accessToken?: string | null;
		}
		interface PageData {
			user: UserSummary | null;
		}
	}
}

export {};
