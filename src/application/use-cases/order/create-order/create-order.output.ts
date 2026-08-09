import type { PaymentStatus } from "@/domain/entities/order.entity.js";

export interface CreateOrderOutput {
    orderId: string;
    total: number;
    paymentStatus: PaymentStatus;
}