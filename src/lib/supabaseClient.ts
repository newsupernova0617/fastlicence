import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
	if (!browser) {
		throw new Error('Supabase client is only available in the browser.');
	}

	if (!supabaseClient) {
		const supabaseUrl = env.PUBLIC_SUPABASE_URL;
		const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY;

		if (!supabaseUrl || !supabaseKey) {
			throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
		}

		supabaseClient = createClient(supabaseUrl, supabaseKey, {
			auth: {
				autoRefreshToken: true,
				persistSession: true,
				detectSessionInUrl: true
			}
		});
	}

	return supabaseClient;
};
