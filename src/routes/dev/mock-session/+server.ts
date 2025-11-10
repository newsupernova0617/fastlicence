import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const MOCK_TOKEN =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtb2NrLXVzZXItaWQiLCJlbWFpbCI6Im1vY2sudXNlckBleGFtcGxlLmNvbSIsInVzZXJfbWV0YWRhdGEiOnsibmlja25hbWUiOiJGYXN0IE1vY2sgVXNlciIsImF2YXRhcl91cmwiOm51bGx9fQ.MOCKSIGNATURE';

const COOKIE_OPTIONS = {
	path: '/',
	httpOnly: false,
	sameSite: 'lax' as const,
	secure: false
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { action } = (await request.json().catch(() => ({}))) as { action?: 'set' | 'clear' };

	if (action === 'clear') {
		cookies.delete('sb-access-token', COOKIE_OPTIONS);
		return json({ ok: true, message: 'Mock session cookie removed.' });
	}

	cookies.set('sb-access-token', MOCK_TOKEN, {
		...COOKIE_OPTIONS,
		maxAge: 60 * 60 * 24
	});

	return json({ ok: true, message: 'Mock session cookie set for Fast Mock User.' });
};
