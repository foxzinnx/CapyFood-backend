import { OrderItem } from "@/domain/entities/order-item.entity.js";
import { Order } from "@/domain/entities/order.entity.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { describe, expect, it } from "vitest";

function makeOrderItem(overrides: Partial<{ quantity: number; unitPrice: number }> = {}) {
  return OrderItem.create({
    menuItemId: new UniqueEntityId(),
    menuItemName: 'Pizza Margherita',
    quantity: overrides.quantity ?? 2,
    unitPrice: overrides.unitPrice ?? 30,
  })
}

describe('OrderItem', () => {
    describe('create', () => {
        it('should create an order item with valid data', () => {
            const item = makeOrderItem();

            expect(item.quantity).toBe(2);
            expect(item.unitPrice).toBe(30);
        });

        it('should calculate subtotal correctly', () => {
            const item = makeOrderItem({ quantity: 3, unitPrice: 10.5 });

            expect(item.subtotal).toBe(31.5);
        });

        it('should throw when quantity is zero', () => {
            expect(() => makeOrderItem({ quantity: 0 })).toThrow('The quantity must be greater than zero.')
        });

        it('should throw when quantity is negative', () => {
            expect(() => makeOrderItem({ quantity: -1 })).toThrow('The quantity must be greater than zero.')
        });

        it('should throw when unitPrice is zero', () => {
            expect(() => makeOrderItem({ unitPrice: 0 })).toThrow('The unit price must be greater than zero.')
        })
    })
});

describe('Order', () => {
    function makeOrderProps(items?: OrderItem[]){
        return {
            customerId: new UniqueEntityId(),
            restaurantId: new UniqueEntityId(),
            items: items ?? [makeOrderItem({ quantity: 2, unitPrice: 20 })]
        }
    }

    describe('create', () => {
        it('should create an order with default PENDING status', () => {
            const order = Order.create(makeOrderProps());

            expect(order.status).toBe('PENDING');
        });

        it('should calculate total from all items', () => {
            const items = [
                makeOrderItem({ quantity: 2, unitPrice: 20 }),
                makeOrderItem({ quantity: 1, unitPrice: 15 })
            ]

            const order = Order.create(makeOrderProps(items));

            expect(order.total).toBe(55);
        });

        it('should throw when items array is empty', () => {
            expect(() => Order.create(makeOrderProps([]))).toThrow('The order must contain at least one item.');
        });

        it('should set createdAt and updatedAt on creation', () => {
            const order = Order.create(makeOrderProps());

            expect(order.createdAt).toBeInstanceOf(Date);
            expect(order.updatedAt).toBeInstanceOf(Date);
        })
    });

    describe('status transitions', () => {
        it('should confirm the order', () => {
            const order = Order.create(makeOrderProps());

            order.confirm();

            expect(order.status).toBe('CONFIRMED')
        });

        it('should move through the full happy path', () => {
            const order = Order.create(makeOrderProps());

            order.confirm();
            expect(order.status).toBe('CONFIRMED');

            order.startPreparing();
            expect(order.status).toBe('PREPARING');

            order.markReady();
            expect(order.status).toBe('READY');

            order.startDelivering();
            expect(order.status).toBe('DELIVERING');

            order.deliver();
            expect(order.status).toBe('DELIVERED')
        });

        it('should cancel the order', () => {
            const order = Order.create(makeOrderProps());

            order.cancel();

            expect(order.status).toBe('CANCELLED');
        });

        it('should update updatedAt when status change', async () => {
            const order = Order.create(makeOrderProps());
            const previousUpdatedAt = order.updatedAt;

            await new Promise((resolve) => setTimeout(resolve, 5));
            order.confirm();

            expect(order.updatedAt.getTime()).toBeGreaterThan(previousUpdatedAt.getTime());
        })
    })

    describe('toOutputDTO', () => {
        it('should map all items to their output DTOs', () => {
            const items = [makeOrderItem({ quantity: 2, unitPrice: 20 })];
            const order = Order.create(makeOrderProps(items));

            const dto = order.toOutputDTO();

            expect(dto.items).toHaveLength(1);
            expect(dto.items[0]?.quantity).toBe(2);
            expect(dto.items[0]?.subtotal).toBe(40);
            expect(dto.total).toBe(40);
            expect(dto.status).toBe('PENDING');
        });

        it('should return notes as null when not provided', () => {
            const order = Order.create(makeOrderProps());

            const dto = order.toOutputDTO();

            expect(dto.notes).toBeNull();
        })
    })
})