import { browser } from '$app/environment';
import { getSupabaseClient } from '$lib/supabaseClient';
import type { UserSummary } from '$lib/types';
import type { Session, User } from '@supabase/supabase-js';
import { readable, writable } from 'svelte/store';

const toUserSummary = (user: User): UserSummary => {
	const nickname =
		(typeof user.user_metadata?.nickname === 'string' && user.user_metadata.nickname.trim().length > 0
			? user.user_metadata.nickname
			: undefined) ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? null;

	return {
		id: user.id,
		email: user.email ?? '',
		nickname,
		avatarUrl: user.user_metadata?.avatar_url ?? null
	};
};

const userStore = writable<UserSummary | null>(null);
const sessionStore = writable<Session | null>(null);
const loadingStore = writable<boolean>(browser);

if (browser) {
	const supabase = getSupabaseClient();
	supabase.auth
		.getSession()
		.then(({ data, error }) => {
			if (error) {
				console.error('Failed to get session', error);
				return;
			}
			const currentSession = data.session ?? null;
			sessionStore.set(currentSession);
			userStore.set(currentSession?.user ? toUserSummary(currentSession.user) : null);
		})
		.finally(() => {
			loadingStore.set(false);
		});

	const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
		sessionStore.set(session);
		userStore.set(session?.user ? toUserSummary(session.user) : null);
	});

	window.addEventListener('beforeunload', () => {
		authListener.subscription.unsubscribe();
	});
} else {
	loadingStore.set(false);
}

export const currentUser = {
	subscribe: userStore.subscribe
};

export const currentSession = readable<Session | null>(null, (set) => {
	const unsubscribe = sessionStore.subscribe(set);
	return () => unsubscribe();
});

export const authLoading = {
	subscribe: loadingStore.subscribe
};
