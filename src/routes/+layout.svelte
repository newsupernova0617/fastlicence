<script lang="ts">

	import '../app.css';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { getSupabaseClient } from '$lib/supabaseClient';
	import { onDestroy } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import HeaderNav from '$lib/components/HeaderNav.svelte';
	import AuthModal from '$lib/components/AuthModal.svelte';
	import { authModalState } from '$lib/stores/ui';
	import { currentUser } from '$lib/stores/auth';
	import type { UserSummary } from '$lib/types';

	let { children, data } = $props<{
		children: unknown;
		data: { user: UserSummary | null };
	}>();

	let isAuthModalOpen = $state(false);
	const unsubscribeAuthModal = authModalState.subscribe((value) => {
		isAuthModalOpen = value;
	});

	let user = $state<UserSummary | null>(data.user ?? null);
	let unsubscribeClientUser: (() => void) | null = null;

	if (browser) {
		(window as any).supabase = getSupabaseClient();
		unsubscribeClientUser = currentUser.subscribe((value) => {
			user = value ?? data.user ?? null;
		});
	}

	onDestroy(() => {
		unsubscribeAuthModal();
		unsubscribeClientUser?.();
	});

	const openAuthModal = () => {
		authModalState.open();
	};

	const closeAuthModal = () => {
		authModalState.close();
	};
	onMount(() => {
		(window as any).supabase = getSupabaseClient();
		console.log('supabase ready:', !!(window as any).supabase);
	});	
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div data-theme="fastsaas" class="min-h-screen bg-base-100 text-base-content transition-colors duration-300">
	<HeaderNav
		user={user}
		on:openAuth={openAuthModal}
	/>
	<main class="mx-auto w-full max-w-6xl px-4 py-8">
		{@render children?.()}
	</main>
</div>

<AuthModal open={isAuthModalOpen} onClose={closeAuthModal} />
