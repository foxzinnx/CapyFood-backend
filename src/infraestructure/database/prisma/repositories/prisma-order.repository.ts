import type { Order } from "@/domain/entities/order.entity.js";
import type { ListOrdersFilters, OrderRepository, PaginatedResult } from "@/domain/repositories/order.repository.js";
import { OrderMapper } from "../mappers/order.mapper.js";
import { prisma } from "../prisma.js";

export class PrismaOrderRepository implements OrderRepository {
    async create(order: Order): Promise<void> {
        const data = OrderMapper.toPrisma(order);
        const items = OrderMapper.itemsToPrisma(order);

        await prisma.$transaction([
            prisma.order.create({ data }),
            prisma.orderItem.createMany({ data: items })
        ]);
    }

    async findById(id: string): Promise<Order | null> {
        const raw = await prisma.order.findUnique({
            where: { id },
            include: { items: true }
        });

        if(!raw) return null;

        return OrderMapper.toDomain(raw);
    }

    async findByCustomerId(customerId: string, filters: ListOrdersFilters): Promise<PaginatedResult<Order>> {
        const page = filters.page ?? 1;
        const perPage = filters.perPage ?? 10;
        const skip = (page - 1) * perPage;

        const [raws, total] = await Promise.all([
            prisma.order.findMany({
                where: { customerId },
                include: { items: true },
                skip,
                take: perPage,
                orderBy: { createdAt: 'desc' }
            }),

            prisma.order.count({ where: { customerId } })
        ]);

        return {
            data: raws.map(OrderMapper.toDomain),
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage)
        }
    }

    async findByRestaurantId(restaurantId: string, filters: ListOrdersFilters): Promise<PaginatedResult<Order>> {
        const page = filters.page ?? 1;
        const perPage = filters.perPage ?? 20;
        const skip = (page - 1) * perPage;

        const [raws, total] = await Promise.all([
            prisma.order.findMany({
                where: { restaurantId },
                include: { items: true },
                skip,
                take: perPage,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.order.count({ where: { restaurantId } })
        ]);

        return { 
            data: raws.map(OrderMapper.toDomain),
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage)
        }
    }

    async save(order: Order): Promise<void> {
        const data = OrderMapper.toPrisma(order);

        await prisma.order.update({
            where: { id: data.id },
            data,
        });
    }

}