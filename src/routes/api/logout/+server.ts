import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, url }) => {
	cookies.delete('sb-access-token', { path: '/' });
	cookies.delete('sb-refresh-token', { path: '/' });
	cookies.delete('sb-auth-token', { path: '/' });

	const redirectTo = url.searchParams.get('redirectTo') ?? '/';
	throw redirect(303, redirectTo);
};
