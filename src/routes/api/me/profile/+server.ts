import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { UserProfile } from '$lib/types';
import { updateMockProfile } from '$lib/mocks/profile';

/**
 * PATCH /api/me/profile
 * 사용자 프로필 수정
 *
 * Request body:
 * - nickname?: string
 * - address?: string
 * - avatarUrl?: string
 *
 * Returns:
 * - Updated UserProfile
 *
 * Requires: Authentication
 */
export const PATCH: RequestHandler = async ({ request, locals }) => {
	try {
		const user = locals.user;

		if (!user) {
			return json(
				{
					error: {
						code: 'UNAUTHORIZED',
						message: '로그인이 필요합니다.'
					}
				},
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { nickname, address, avatarUrl } = body;

		// 유효성 검사
		if (nickname !== undefined && typeof nickname !== 'string') {
			return json(
				{
					error: {
						code: 'VALIDATION_ERROR',
						message: '닉네임은 문자열이어야 합니다.'
					}
				},
				{ status: 400 }
			);
		}

		if (address !== undefined && typeof address !== 'string') {
			return json(
				{
					error: {
						code: 'VALIDATION_ERROR',
						message: '주소는 문자열이어야 합니다.'
					}
				},
				{ status: 400 }
			);
		}

		// TODO: Supabase 연동
		// const { data, error } = await supabase
		//   .from('users')
		//   .update({
		//     nickname: nickname ?? undefined,
		//     address_text: address ?? undefined,
		//     avatar_url: avatarUrl ?? undefined,
		//     updated_at: new Date().toISOString()
		//   })
		//   .eq('id', user.id)
		//   .select()
		//   .single();

		// 임시: 목업 데이터 업데이트
		const updatedProfile = updateMockProfile({ nickname, address, avatarUrl });

		// 실제 사용자 정보 반영
		const result: UserProfile = {
			id: user.id,
			email: user.email,
			nickname: nickname ?? user.nickname ?? user.email.split('@')[0],
			avatarUrl: avatarUrl ?? user.avatarUrl ?? null,
			address: address ?? updatedProfile.address
		};

		return json(result);
	} catch (error) {
		console.error('Error updating profile:', error);
		return json(
			{
				error: {
					code: 'INTERNAL_ERROR',
					message: '프로필 업데이트 중 오류가 발생했습니다.'
				}
			},
			{ status: 500 }
		);
	}
};
