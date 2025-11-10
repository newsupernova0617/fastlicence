<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let status = $state<string | null>(null);
	let loading = $state(false);
	let hasSession = $state(false);

	const checkSession = () => {
		if (!browser) return false;
		return document.cookie.includes('sb-access-token=');
	};

	onMount(() => {
		hasSession = checkSession();
	});

	const setSession = async () => {
		loading = true;
		status = null;
		try {
			const res = await fetch('/dev/mock-session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'set' })
			});
			const data = await res.json();
			status = data.message || '세션이 설정되었습니다.';
			setTimeout(() => {
				hasSession = checkSession();
			}, 100);
		} catch (e) {
			status = '오류: ' + (e instanceof Error ? e.message : '알 수 없는 오류');
		} finally {
			loading = false;
		}
	};

	const clearSession = async () => {
		loading = true;
		status = null;
		try {
			const res = await fetch('/dev/mock-session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'clear' })
			});
			const data = await res.json();
			status = data.message || '세션이 삭제되었습니다.';
			setTimeout(() => {
				hasSession = checkSession();
			}, 100);
		} catch (e) {
			status = '오류: ' + (e instanceof Error ? e.message : '알 수 없는 오류');
		} finally {
			loading = false;
		}
	};
</script>

<svelte:head>
	<title>Mock Session Helper | FastLicense</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="mx-auto flex w-full max-w-3xl flex-col gap-8 rounded-3xl border border-base-300 bg-base-100 p-8 shadow-lg">
	<header class="space-y-3">
		<h1 class="text-3xl font-semibold">Mock Session Helper</h1>
		<p class="text-sm text-base-content/70 leading-relaxed">
			백엔드가 준비되지 않은 상태에서도 보호 페이지를 테스트할 수 있도록
			<code class="badge badge-sm badge-outline">sb-access-token</code> 쿠키를 설정하거나 제거합니다.
		</p>
	</header>

	<div class="grid gap-4 md:grid-cols-2">
		<!-- svelte-ignore event_directive_deprecated -->
		<button
			class="btn btn-primary btn-lg"
			disabled={loading}
			on:click={setSession}
		>
			{#if loading}
				<span class="loading loading-spinner"></span>
			{:else}
				모의 로그인 쿠키 설정
			{/if}
		</button>
		<!-- svelte-ignore event_directive_deprecated -->
		<button
			class="btn btn-outline btn-error btn-lg"
			disabled={loading}
			on:click={clearSession}
		>
			{#if loading}
				<span class="loading loading-spinner"></span>
			{:else}
				쿠키 제거
			{/if}
		</button>
	</div>

	{#if status}
		<div class="alert alert-info">
			{status}
		</div>
	{/if}

	<div class="rounded-2xl border border-dashed border-base-300 bg-base-200/40 p-4 text-sm flex items-center gap-3">
		<span class={`badge ${hasSession ? 'badge-success' : 'badge-ghost'} badge-lg`}>
			{hasSession ? '세션 활성화됨' : '세션 없음'}
		</span>
		<p class="text-base-content/70">
			{hasSession
				? '보호 페이지에서 목업 데이터가 바로 표시됩니다.'
				: '로그인 필요한 경로에 접근하기 전에 모의 로그인 쿠키를 먼저 설정하세요.'}
		</p>
	</div>

	<section class="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-6">
		<h2 class="text-xl font-semibold">현재 목업 데이터가 붙어 있는 페이지</h2>
		<div class="space-y-4">
			<div>
				<h3 class="font-semibold mb-2">공개 페이지</h3>
				<div class="space-y-2">
					<a href="/" class="block text-primary hover:underline">홈</a>
					<a href="/courses" class="block text-primary hover:underline">강의 목록</a>
					<a href="/courses/course-ai-accelerator" class="block text-primary hover:underline">강의 상세</a>
				</div>
			</div>
			<div>
				<h3 class="font-semibold mb-2">로그인 필요 페이지</h3>
				<div class="space-y-2">
					<a href="/mypage" class="block text-primary hover:underline">마이페이지</a>
					<a href="/learning" class="block text-primary hover:underline">학습 홈</a>
					<a href="/checkout?courseId=course-ai-accelerator" class="block text-primary hover:underline">결제 페이지</a>
				</div>
			</div>
		</div>
	</section>
</section>
