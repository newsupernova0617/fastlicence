<script lang="ts">
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import { goto } from '$app/navigation';
	import { authModalState } from '$lib/stores/ui';
	import { getSupabaseClient } from '$lib/supabaseClient';

	let status: 'loading' | 'success' | 'error' = 'loading';
	let errorMessage = '';

	type Provider = 'google' | 'kakao';

	const apiOrigin = env.PUBLIC_AUTH_API_URL
		? env.PUBLIC_AUTH_API_URL.replace(/\/+$/, '')
		: '';

	const finalize = async () => {
		if (!browser) return;

		const searchParams = new URL(window.location.href).searchParams;
		const code = searchParams.get('code');
		const state = (searchParams.get('state') ?? undefined) as Provider | undefined;
		const oauthError = searchParams.get('error_description') ?? searchParams.get('error');

		if (oauthError) {
			status = 'error';
			errorMessage = oauthError;
			return;
		}

		if (!code) {
			status = 'error';
			errorMessage = 'OAuth 코드가 없습니다.';
			return;
		}

		if (!state) {
			status = 'error';
			errorMessage = '로그인 공급자를 확인할 수 없습니다.';
			return;
		}
		const provider = state === 'google' ? 'google' : state === 'kakao' ? 'kakao' : null;
		if (!provider) {
			status = 'error';
			errorMessage = '알 수 없는 로그인 공급자입니다.';
			return;
		}

		try {
			const redirectUri = `${window.location.origin}/auth/callback`;
			const endpoint = `${apiOrigin || ''}/auth/${provider}-login`;
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					code,
					redirectUri
				})
			});

			const payload = await response.json().catch(() => null);
			if (!response.ok) {
				throw new Error(payload?.error ?? response.statusText ?? '토큰 발급에 실패했습니다.');
			}

			if (!payload?.access_token || !payload?.refresh_token) {
				throw new Error('서버에서 액세스/리프레시 토큰을 반환하지 않았습니다.');
			}

			const supabase = getSupabaseClient();
			const { error } = await supabase.auth.setSession({
				access_token: payload.access_token,
				refresh_token: payload.refresh_token
			});
			if (error) throw error;

			const url = new URL(window.location.href);
			url.hash = '';
			url.search = '';
			history.replaceState({}, document.title, url.toString());
			status = 'success';
			authModalState.close();
			await goto('/');
		} catch (error) {
			status = 'error';
			errorMessage = error instanceof Error ? error.message : 'OAuth 처리가 실패했습니다.';
		}
	};

	if (browser) {
		finalize();
	}
</script>

<section class="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
	<span class="loading loading-spinner loading-lg text-primary" aria-hidden="true"></span>
	{#if status === 'loading'}
		<p class="text-base-content/70">로그인 정보를 확인하는 중입니다...</p>
	{:else if status === 'success'}
		<p class="text-base-content/70">로그인에 성공했습니다. 잠시 후 이동합니다.</p>
	{:else}
		<div role="alert" class="alert alert-error flex max-w-md">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
			</svg>
			<div class="text-left text-sm">
				<p class="font-semibold">로그인에 실패했습니다</p>
				<p>{errorMessage}</p>
			</div>
		</div>
		<a class="btn btn-primary" href="/">다시 시도하기</a>
	{/if}
</section>
