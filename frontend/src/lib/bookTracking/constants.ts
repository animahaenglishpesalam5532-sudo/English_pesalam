export const COURIER_OPTIONS = ['Indian Postal', 'Professional', 'DTDC', 'ST'] as const
export type CourierName = (typeof COURIER_OPTIONS)[number]
