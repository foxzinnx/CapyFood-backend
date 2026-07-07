import type { OrderItemOutputDTO } from "@/domain/entities/order-item.entity.js";
import type { OrderOutputDTO } from "@/domain/entities/order.entity.js";

export interface ListCustomerOrdersOutput {
    orders: OrderOutputDTO[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}