<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { getSupabaseClient } from '$lib/supabaseClient';
	import { env } from '$env/dynamic/public';

	type OAuthProvider = 'google' | 'kakao';

	let { open, onClose } = $props<{ open: boolean; onClose: () => void }>();

	let loadingProvider = $state<OAuthProvider | null>(null);
	let errorMessage = $state('');
	let wasOpen = $state(open);

	$effect(() => {
		if (open && !wasOpen) {
			errorMessage = '';
			loadingProvider = null;
		}
		wasOpen = open;
	});

	const handleDialogClose = () => {
		if (loadingProvider) {
			return;
		}
		errorMessage = '';
		onClose();
	};

	const handleGoogleLogin = async () => {
		if (!browser) return;
		errorMessage = '';
		loadingProvider = 'google';

		try {
			const supabase = getSupabaseClient();
			const redirectTo = `${window.location.origin}/auth/callback`;

			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo,
					queryParams: {
						access_type: 'offline',
						prompt: 'consent'
					}
				}
			});

			if (error) {
				throw error;
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
			errorMessage = `Google 로그인에 실패했습니다. ${message}`;
			loadingProvider = null;
		}
	};

	const handleKakaoLogin = () => {
		if (!browser) return;
		errorMessage = '';
		loadingProvider = 'kakao';

		const kakaoClientId = env.PUBLIC_KAKAO_CLIENT_ID;
		const kakaoRedirect = env.PUBLIC_KAKAO_REDIRECT_URI;

		if (!kakaoClientId || !kakaoRedirect) {
			errorMessage = '카카오 로그인 환경 변수가 설정되지 않았습니다.';
			loadingProvider = null;
			return;
		}

		const params = new URLSearchParams({
			client_id: kakaoClientId,
			redirect_uri: kakaoRedirect,
			response_type: 'code',
			scope: 'profile_nickname profile_image account_email'
		});

		window.location.href = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
	};

	const goToCourses = () => {
		handleDialogClose();
		void goto('/courses');
	};
</script>

{#if open}
	<dialog class="modal modal-open animate-fade-in" open>
		<div class="modal-box max-w-md space-y-6 bg-base-100 shadow-2xl rounded-2xl border border-base-200 transition-colors duration-300">
			<!-- Header with icon -->
			<div class="flex items-start justify-between">
				<div class="space-y-3 flex-1">
					<div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
					</div>
					<div>
						<h2 class="text-2xl font-bold text-base-content">빠른 로그인</h2>
						<p class="text-sm text-base-content/60 mt-1">SNS 계정으로 3초만에 시작하세요</p>
					</div>
				</div>
				{#if !loadingProvider}
					<button
						type="button"
						class="btn btn-ghost btn-sm btn-circle hover:bg-base-200 transition-colors"
						onclick={handleDialogClose}
						aria-label="닫기"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				{/if}
			</div>

			{#if errorMessage}
				<div role="alert" class="alert alert-error text-sm shadow-md rounded-xl animate-fade-in">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
					</svg>
					<span>{errorMessage}</span>
				</div>
			{/if}

			<div class="space-y-3">
				<button
					type="button"
					class="btn btn-lg w-full gap-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-primary/30 shadow-md hover:shadow-lg transition-all duration-300"
					class:loading={loadingProvider === 'google'}
					class:opacity-50={loadingProvider !== null && loadingProvider !== 'google'}
					onclick={handleGoogleLogin}
					disabled={loadingProvider !== null}
				>
					{#if loadingProvider !== 'google'}
						<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 48 48">
							<path fill="#EA4335" d="M24 9.5c3.54 0 6 1.54 7.38 2.83l5.38-5.38C33.66 3.42 29.23 1 24 1 14.86 1 7.17 6.9 3.9 15.1l6.68 5.19C11.85 14.02 17.45 9.5 24 9.5z" />
							<path fill="#4285F4" d="M46.5 24.5c0-1.64-.15-3.21-.43-4.74H24v9.54h12.65c-.55 2.82-2.2 5.2-4.7 6.81l7.27 5.64C43.68 38.95 46.5 32.3 46.5 24.5z" />
							<path fill="#FBBC05" d="M10.58 28.29a14.5 14.5 0 0 1 0-9.58l-6.68-5.19A23.958 23.958 0 0 0 1.5 24c0 3.87.92 7.53 2.4 10.48l6.68-5.19z" />
							<path fill="#34A853" d="M24 46.5c6.23 0 11.47-2.05 15.29-5.59l-7.27-5.64C30.17 36.94 27.28 38 24 38c-6.55 0-12.15-4.52-14.05-10.69l-6.68 5.19C7.17 41.1 14.86 46.5 24 46.5z" />
							<path fill="none" d="M0 0h48v48H0z" />
						</svg>
					{/if}
					<span class="font-semibold">Google로 계속하기</span>
				</button>

				<button
					type="button"
					class="btn btn-lg w-full gap-3 bg-[#FEE500] hover:bg-[#FDD835] text-gray-900 border-0 shadow-md hover:shadow-lg transition-all duration-300"
					class:loading={loadingProvider === 'kakao'}
					class:opacity-50={loadingProvider !== null && loadingProvider !== 'kakao'}
					onclick={handleKakaoLogin}
					disabled={loadingProvider !== null}
				>
					{#if loadingProvider !== 'kakao'}
						<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M12 4c-5.523 0-10 2.985-10 6.667 0 2.386 1.833 4.47 4.567 5.668L5.2 20.8a.5.5 0 0 0 .8.6l3.8-3.8c.715.094 1.45.067 2.2.067 5.523 0 10-2.985 10-6.667S17.523 4 12 4"
							/>
						</svg>
					{/if}
					<span class="font-semibold">카카오로 계속하기</span>
				</button>
			</div>

			<!-- Security badge -->
			<div class="flex items-center justify-center gap-2 text-xs text-base-content/50">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
				</svg>
				<span>안전한 OAuth 2.0 인증</span>
			</div>

			<div class="divider my-2">또는</div>

			<div class="text-center space-y-2">
				<p class="text-sm text-base-content/70">회원이 아니신가요?</p>
				<button type="button" class="btn btn-link btn-sm text-primary hover:text-primary/80 transition-colors" onclick={goToCourses}>
					추천 강의 둘러보기 →
				</button>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop bg-black/40 backdrop-blur-sm" onsubmit={handleDialogClose}>
			<button aria-label="닫기"></button>
		</form>
	</dialog>
{/if}
