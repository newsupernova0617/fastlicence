<script lang="ts">
	import { browser } from '$app/environment';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { getSupabaseClient } from '$lib/supabaseClient';
	import type { UserSummary } from '$lib/types';

const dispatch = createEventDispatcher<{ openAuth: void }>();

	type NavLink = {
		href: string;
		label: string;
		requiresAuth?: boolean;
	};

	const navLinks: NavLink[] = [
		{ href: '/courses', label: '강의' },
		{ href: '/mypage', label: '마이페이지', requiresAuth: true }
	];

let { user } = $props<{ user: UserSummary | null }>();

let pathname = $state('/');
let profileMenuOpen = $state(false);
let logoutLoading = $state(false);

	const unsubscribePage = page.subscribe(($page) => {
		pathname = $page.url.pathname;
	});

	onDestroy(() => {
		unsubscribePage();
	});

	const openAuthModal = () => {
		dispatch('openAuth');
	};

	const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

	const handleLogout = async () => {
		if (!browser || logoutLoading) return;
		logoutLoading = true;
		try {
			const supabase = getSupabaseClient();
			const { error } = await supabase.auth.signOut();
			if (error) {
				throw error;
			}
		} catch (error) {
			console.error('Logout failed', error);
		} finally {
			logoutLoading = false;
			await fetch('/api/logout', {
				method: 'POST',
				credentials: 'same-origin'
			});
			profileMenuOpen = false;
		}
	};
</script>

<header class="sticky top-0 z-50 backdrop-blur-md border-b border-base-200/30 shadow-md transition-all duration-300">
	<div class="navbar mx-auto w-full max-w-7xl px-4 md:px-6 py-3">
		<div class="navbar-start gap-2 md:gap-4">
			<details class="dropdown md:hidden">
				<summary class="btn btn-ghost btn-sm btn-circle hover:bg-base-200 transition-colors" aria-label="메뉴 열기">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</summary>
				<ul class="menu dropdown-content mt-3 w-56 rounded-xl bg-base-100 p-2 shadow-2xl border border-base-200 animate-fade-in">
					{#each navLinks as link}
						{#if !link.requiresAuth || user}
							<li class:active={isActive(link.href)}>
								<a
									href={link.href}
									class={`rounded-lg transition-all duration-200 ${isActive(link.href) ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-base-200'}`}
								>
									{link.label}
								</a>
							</li>
						{/if}
					{/each}
				</ul>
			</details>
			<a class="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity" href="/">
				FastLicense
			</a>
			<nav class="hidden md:flex">
				<ul class="menu menu-horizontal gap-1 px-2">
					{#each navLinks as link}
						{#if !link.requiresAuth || user}
							<li>
								<a
									href={link.href}
									class={`px-4 py-2 font-medium rounded-lg relative group transition-all duration-200 text-base-content hover:text-primary ${isActive(link.href) ? 'text-primary font-semibold' : ''}`}
								>
									{link.label}
									{#if isActive(link.href)}
										<span class="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full"></span>
									{/if}
									<span class="absolute bottom-0 left-0 right-0 h-1 bg-primary/20 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
								</a>
							</li>
						{/if}
					{/each}
				</ul>
			</nav>
		</div>
		<div class="navbar-end gap-2 md:gap-3">
			{#if user}
				<details class="dropdown dropdown-end" bind:open={profileMenuOpen}>
					<summary
						class="group flex items-center gap-3 rounded-full border border-base-200/80 bg-base-100/80 px-2.5 py-1.5 text-left transition-all duration-200 hover:border-base-300 hover:bg-base-200/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
						aria-label="사용자 메뉴 열기"
						aria-expanded={profileMenuOpen}
					>
						<span class="sr-only md:hidden">{user.nickname ?? user.email}</span>
						<div class="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary via-primary/80 to-accent text-primary-content shadow-md ring-1 ring-base-100/70 transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-lg">
							{#if user.avatarUrl}
								<img src={user.avatarUrl} alt="{user.nickname ?? user.email} 프로필 이미지" class="h-full w-full object-cover" loading="lazy" decoding="async" />
							{:else}
								<span class="text-base font-semibold tracking-tight">
									{user.nickname?.slice(0, 1) ?? user.email.slice(0, 1).toUpperCase()}
								</span>
							{/if}
						</div>
						<span class="hidden min-w-0 md:flex flex-col">
							<span class="text-sm font-semibold leading-tight text-base-content" title={user.nickname ?? user.email}>
								{user.nickname ?? user.email}
							</span>
							<span class="text-xs font-medium leading-tight text-base-content/70 truncate max-w-[140px]" title={user.email}>{user.email}</span>
						</span>
					</summary>
					<ul class="menu dropdown-content z-10 mt-3 w-56 rounded-xl bg-base-100 p-2 shadow-2xl border border-base-200 animate-fade-in">
						<li class="menu-title px-4 py-3">
							<div class="flex flex-col gap-0.5">
								<span class="text-sm font-semibold text-base-content">{user.nickname ?? user.email}</span>
								<span class="text-xs text-base-content/60">{user.email}</span>
							</div>
						</li>
						<div class="divider my-1"></div>
						<li>
							<a href="/mypage" class="rounded-lg transition-all duration-200 hover:bg-primary/10">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
								마이페이지
							</a>
						</li>
						<li>
							<a href="/learning" class="rounded-lg transition-all duration-200 hover:bg-primary/10">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
								</svg>
								학습하기
							</a>
						</li>
						<div class="divider my-1"></div>
						<li>
							<button
								type="button"
								class="w-full rounded-lg hover:bg-error/10 hover:text-error transition-all duration-200"
								onclick={handleLogout}
								class:loading={logoutLoading}
								disabled={logoutLoading}
							>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
								</svg>
								로그아웃
							</button>
						</li>
					</ul>
				</details>
			{:else}
				<button
					type="button"
					class="group relative btn bg-gradient-to-r from-primary to-accent border-0 text-white text-sm md:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:brightness-110 gap-2 md:gap-2.5 px-4 md:px-6"
					onclick={openAuthModal}
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
					</svg>
					<span class="hidden md:inline">로그인</span>
				</button>
			{/if}
		</div>
	</div>
</header>
