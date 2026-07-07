import type { OrderItemInput } from "./order-item.input.js";

export interface CreateOrderInput {
    customerId: string;
    restaurantId: string;
    items: OrderItemInput[];
    notes?: string | undefined;
}