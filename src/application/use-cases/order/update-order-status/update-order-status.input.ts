import type { OrderStatus } from "@/domain/entities/order.entity.js";

export interface UpdateOrderStatusInput {
    orderId: string;
    ownerId: string;
    newStatus: OrderStatus
}