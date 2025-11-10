<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { createOrder } from '$lib/api';
	import type { CourseDetail, PaymentProvider } from '$lib/types';
	import { formatCurrency } from '$lib/utils/format';
	import { createEventDispatcher } from 'svelte';

	type Props = {
		course: CourseDetail;
		disabled?: boolean;
	};

	const { course, disabled = false } = $props() as Props;
	const dispatch = createEventDispatcher<{ success: { orderNumber: string; redirectUrl: string } }>();

	const paymentOptions: { value: PaymentProvider; label: string; description: string }[] = [
		{ value: 'kakaopay', label: '카카오페이', description: '모바일 결제에 최적화된 간편 결제' },
		{ value: 'tosspay', label: '토스페이', description: '토스 계정으로 빠르게 결제' },
		{ value: 'naverpay', label: '네이버페이', description: '송금, 포인트를 활용한 결제' },
		{ value: 'card', label: '신용/체크카드', description: '일반 카드 결제' }
	];

	let selectedProvider = $state<PaymentProvider>('kakaopay');
	let isSubmitting = $state(false);
	let errorMessage = $state('');

	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		if (disabled || !browser) {
			return;
		}
		isSubmitting = true;
		errorMessage = '';

		const result = await createOrder(fetch, { courseId: course.id, provider: selectedProvider });
		isSubmitting = false;

		if (!result.data) {
			errorMessage = result.error?.message ?? '결제를 생성할 수 없었습니다.';
			return;
		}

		dispatch('success', result.data);
		await goto(result.data.redirectUrl);
	};
</script>

<form class="space-y-6 animate-fade-in" onsubmit={handleSubmit}>
	<!-- Order Summary Card -->
	<section class="card-modern overflow-hidden">
		<div class="bg-gradient-to-br from-primary/5 to-accent/5 p-6 border-b border-base-300">
			<div class="flex items-center gap-3 mb-4">
				<div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
				<h2 class="text-xl font-bold">주문 정보</h2>
			</div>

			<div class="grid gap-6 md:grid-cols-[2fr,1fr]">
				<div class="space-y-3">
					<div class="space-y-1">
						<p class="text-xs font-medium text-base-content/60 uppercase tracking-wide">수강 강의</p>
						<h3 class="text-xl font-bold leading-tight">{course.title}</h3>
					</div>
					{#if course.subtitle}
						<p class="text-sm text-base-content/70 leading-relaxed">{course.subtitle}</p>
					{/if}
					<div class="flex flex-wrap items-center gap-3 text-sm">
						<div class="flex items-center gap-1.5 text-base-content/70">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
							<span class="font-medium">{course.instructor}</span>
						</div>
						<span class="text-base-content/40">·</span>
						<div class="flex items-center gap-1.5 text-base-content/70">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
							</svg>
							<span>{course.lectures.length}개 강의</span>
						</div>
					</div>
				</div>
				<div class="rounded-2xl bg-base-100 border-2 border-primary/20 p-5 shadow-lg">
					<p class="text-xs font-medium text-base-content/60 mb-2 uppercase tracking-wide">최종 결제금액</p>
					<p class="text-3xl font-bold text-primary mb-2">
						{formatCurrency(course.salePrice ?? course.originalPrice)}
					</p>
					{#if course.salePrice && course.salePrice < course.originalPrice}
						<div class="space-y-1">
							<p class="text-sm text-base-content/50 line-through">
								{formatCurrency(course.originalPrice)}
							</p>
							<span class="badge badge-secondary badge-sm font-bold">
								{Math.round(((course.originalPrice - course.salePrice) / course.originalPrice) * 100)}% 할인
							</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<!-- Payment Method Selection -->
	<section class="card-modern p-6">
		<div class="flex items-center gap-3 mb-5">
			<div class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
				</svg>
			</div>
			<h2 class="text-xl font-bold">결제 수단 선택</h2>
		</div>

		<div class="grid gap-3 md:grid-cols-2">
			{#each paymentOptions as option}
				<label
					class={`group relative flex cursor-pointer flex-col gap-3 rounded-2xl border-2 p-5 transition-all duration-300 hover:shadow-lg ${
						selectedProvider === option.value
							? 'border-primary bg-primary/5 shadow-md'
							: 'border-base-300 bg-base-100 hover:border-primary/40'
					} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
				>
					<span class="flex items-center gap-3">
						<input
							type="radio"
							name="provider"
							value={option.value}
							checked={selectedProvider === option.value}
							onchange={() => (selectedProvider = option.value)}
							disabled={disabled}
							class="radio radio-primary"
						/>
						<span class="text-base font-bold">{option.label}</span>
					</span>
					<p class="text-sm text-base-content/60 leading-relaxed pl-8">{option.description}</p>

					<!-- Selected indicator -->
					{#if selectedProvider === option.value}
						<div class="absolute top-3 right-3">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
					{/if}
				</label>
			{/each}
		</div>
	</section>

	<!-- Security Notice -->
	<div class="flex items-center justify-center gap-3 text-sm text-base-content/60 px-4">
		<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
		</svg>
		<span>SSL 보안 결제 시스템으로 안전하게 보호됩니다</span>
	</div>

	{#if errorMessage}
		<div role="alert" class="alert alert-error shadow-lg rounded-2xl animate-fade-in">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span>{errorMessage}</span>
		</div>
	{/if}

	<button
		type="submit"
		class="btn btn-lg w-full border-2 border-primary shadow-xl hover:shadow-2xl transition-all duration-300 font-bold text-lg"
		class:btn-primary={!isSubmitting && !disabled && !isSubmitting}
		class:bg-primary={!isSubmitting && !disabled}
		class:text-white={!isSubmitting && !disabled}
		class:opacity-60={disabled || isSubmitting}
		disabled={disabled || isSubmitting}
	>
		{#if isSubmitting}
			<span class="loading loading-spinner"></span>
			<span>결제 처리 중...</span>
		{:else}
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span>{formatCurrency(course.salePrice ?? course.originalPrice)} 결제하기</span>
		{/if}
	</button>
</form>
