import type { CreateOrderResponse, PaymentConfirmation, PaymentProvider } from '$lib/types';

const orderCourseMap = new Map<string, string>();
let mockSequence = 1;

export const createMockOrder = (
	courseId: string,
	provider: PaymentProvider
): CreateOrderResponse => {
	const orderNumber = `MOCK-${Date.now()}-${mockSequence++}`;
	const redirectUrl = `/checkout/success?orderNumber=${orderNumber}&provider=${provider}`;
	orderCourseMap.set(orderNumber, courseId);
	return {
		orderNumber,
		redirectUrl,
		courseId
	};
};

export const confirmMockPayment = (orderNumber: string): PaymentConfirmation => {
	const courseId = orderCourseMap.get(orderNumber) ?? 'unknown-course';
	return {
		status: 'paid',
		courseId
	};
};
