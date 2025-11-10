import { Buffer } from 'node:buffer';
import type { Handle } from '@sveltejs/kit';

type JwtPayload = {
	sub: string;
	email?: string;
	user_metadata?: {
		nickname?: string;
		full_name?: string;
		name?: string;
		avatar_url?: string;
	};
};

const decodeJwt = (token: string): JwtPayload | null => {
	const [, payload] = token.split('.');
	if (!payload) return null;
	try {
		const decoded = Buffer.from(payload, 'base64url').toString('utf8');
		return JSON.parse(decoded) as JwtPayload;
	} catch (error) {
		console.error('Failed to decode JWT payload', error);
		return null;
	}
};

export const handle: Handle = async ({ event, resolve }) => {
	const accessToken = event.cookies.get('sb-access-token');
	event.locals.accessToken = accessToken ?? null;
	let user = null;

	if (accessToken) {
		const payload = decodeJwt(accessToken);
		if (payload?.sub && payload.email) {
			user = {
				id: payload.sub,
				email: payload.email,
				nickname:
					payload.user_metadata?.nickname ??
					payload.user_metadata?.full_name ??
					payload.user_metadata?.name ??
					payload.email.split('@')[0],
				avatarUrl: payload.user_metadata?.avatar_url ?? null
			};
		}
	}

	event.locals.user = user;

	const response = await resolve(event);
	return response;
};
