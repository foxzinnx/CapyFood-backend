import { OrderItem } from "@/domain/entities/order-item.entity.js";
import { Order } from "@/domain/entities/order.entity.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { OrderStatus as PrismaOrderStatus, Order as PrismaOrder, OrderItem as PrismaOrderItem } from "@/generated/prisma/client.js";

type PrismaOrderWithItems = PrismaOrder & {
    items: PrismaOrderItem[]
}

export class OrderMapper {
    static toDomain(raw: PrismaOrderWithItems): Order {
        const items = raw.items.map((item) => 
            OrderItem.create(
                {
                    menuItemId: new UniqueEntityId(item.menuItemId),
                    menuItemName: item.menuItemName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice.toNumber()
                },
                new UniqueEntityId(item.id)
            )
        )

        return Order.create(
            {
                customerId: new UniqueEntityId(raw.customerId),
                restaurantId: new UniqueEntityId(raw.restaurantId),
                items,
                status: raw.status,
                notes: raw.notes,
            },
            new UniqueEntityId(raw.id)
        )
    }

    static toPrisma(order: Order){
        return {
            id: order.id.value,
            customerId: order.customerId.value,
            restaurantId: order.restaurantId.value,
            status: order.status as PrismaOrderStatus,
            total: order.total,
            notes: order.notes ?? null,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        }
    }

    static itemsToPrisma(order: Order){
        return order.items.map((item) => ({
            id: item.id.value,
            orderId: order.id.value,
            menuItemId: item.menuItemId.value,
            menuItemName: item.menuItemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
        }));
    }
}