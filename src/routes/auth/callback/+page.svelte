<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { authModalState } from '$lib/stores/ui';
	import { getSupabaseClient } from '$lib/supabaseClient';

	let status: 'loading' | 'success' | 'error' = 'loading';
	let errorMessage = '';

	const finalize = async () => {
		if (!browser) return;

		const supabase = getSupabaseClient();

		try {
			const { data, error } = await supabase.auth.getSession();
			if (error) {
				throw error;
			}

			if (data?.session) {
				const url = new URL(window.location.href);
				url.hash = '';
				history.replaceState({}, document.title, url.toString());
				status = 'success';
				authModalState.close();
				await goto('/');
				return;
			}

			status = 'error';
			errorMessage = '세션 정보를 찾을 수 없습니다.';
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
