import { writable } from 'svelte/store';

const authModalInternal = writable(false);

export const authModalState = {
	subscribe: authModalInternal.subscribe,
	open: () => authModalInternal.set(true),
	close: () => authModalInternal.set(false),
	toggle: () => authModalInternal.update((value) => !value)
};
