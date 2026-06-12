import type { Order } from "@/domain/entities/order.entity.js";
import type { ListOrdersFilters, OrderRepository, PaginatedResult } from "@/domain/repositories/order.repository.js";

export class InMemoryOrderRepository implements OrderRepository{
    public items: Order[] = [];

    async create(order: Order): Promise<void> {
        this.items.push(order);
    }

    async findById(id: string): Promise<Order | null> {
        return this.items.find((o) => o.id.value === id) ?? null;
    }

    async findByCustomerId(customerId: string, filters: ListOrdersFilters): Promise<PaginatedResult<Order>> {
        const page = filters.page ?? 1;
        const perPage = filters.perPage ?? 10;

        const data = this.items.filter((o) => o.customerId.value === customerId);
        const total = data.length;
        const paginated = data.slice((page - 1) * perPage, page * perPage);

        return {
            data: paginated,
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage)
        }
    }

    async findByRestaurantId(restaurantId: string, filters: ListOrdersFilters): Promise<PaginatedResult<Order>> {
        const page = filters.page ?? 1;
        const perPage = filters.perPage ?? 20;

        const data = this.items.filter((o) => o.restaurantId.value === restaurantId);
        const total = data.length;
        const paginated = data.slice((page - 1) * perPage, page * perPage);

        return {
            data: paginated,
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage)
        }
    }

    async save(order: Order): Promise<void> {
        const index = this.items.findIndex((o) => o.id.value === order.id.value);
        if(index > 0) this.items[index] = order;
    }

}