import type { OrderOutputDTO } from "@/domain/entities/order.entity.js";

export interface ListRestaurantsOrdersOutput{
    orders: OrderOutputDTO[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}