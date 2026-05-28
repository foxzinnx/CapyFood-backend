import type { OrderStatus } from "./order.entity.js";

export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY'],
    READY: ['DELIVERING'],
    DELIVERING: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: []
}

export const CUSTOMER_CANCELLABLE: OrderStatus[] = ['PENDING', 'CONFIRMED'];

export function isTransitionAllowed(from: OrderStatus, to: OrderStatus): boolean {
    return ALLOWED_TRANSITIONS[from].includes(to);
}