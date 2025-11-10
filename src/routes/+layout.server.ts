import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.user ?? null
	};
};


<script>
  import { getSupabaseClient } from '$lib/supabaseClient';

  if (typeof window !== "undefined") {
    window.supabase = getSupabaseClient();
  }
</script>

<slot />
