import { CancelOrderUseCase } from "@/application/use-cases/cancel-order/cancel-order.use-case.js"
import { NotAllowedError } from "@/domain/errors/not-allowed.error.js"
import { OrderAlreadyCancelledError } from "@/domain/errors/order-already-cancelled.error.js"
import { OrderCannotBeCancelledError } from "@/domain/errors/order-cannot-be-cancelled.error.js"
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js"
import { makeCustomer, makeMenuItem, makeOrder, makeRestaurant } from "@/tests/helpers/make-order-test-entities.js"
import { InMemoryCustomerRepository } from "@/tests/repositories/in-memory-customer.repository.js"
import { InMemoryMenuItemRepository } from "@/tests/repositories/in-memory-menu-item.repository.js"
import { InMemoryOrderRepository } from "@/tests/repositories/in-memory-order.repository.js"
import { InMemoryRestaurantRepository } from "@/tests/repositories/in-memory-restaurant.repository.js"
import { beforeEach, describe, expect, it } from "vitest"

let customerRepository: InMemoryCustomerRepository
let restaurantRepository: InMemoryRestaurantRepository
let menuItemRepository: InMemoryMenuItemRepository
let orderRepository: InMemoryOrderRepository
let sut: CancelOrderUseCase

describe('CancelOrderUseCase', () => {
    beforeEach(() => {
        customerRepository = new InMemoryCustomerRepository();
        restaurantRepository = new InMemoryRestaurantRepository();
        menuItemRepository = new InMemoryMenuItemRepository();
        orderRepository = new InMemoryOrderRepository();
        sut = new CancelOrderUseCase(orderRepository);
    });

    it('should cancel a pending order', async () => {
        const customer = await makeCustomer(customerRepository)
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1')
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value)
        const order = await makeOrder(orderRepository, customer.id.value, restaurant.id.value, menuItem.id.value)

        const result = await sut.execute({
            orderId: order.id.value,
            customerId: customer.id.value
        });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.status).toBe('CANCELLED')
        }
        expect(orderRepository.items[0]?.status).toBe('CANCELLED')
    });

    it('should cancel a confirmed order', async () => {
        const customer = await makeCustomer(customerRepository)
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1')
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value)
        const order = await makeOrder(orderRepository, customer.id.value, restaurant.id.value, menuItem.id.value)
        order.confirm();
        await orderRepository.save(order);

        const result = await sut.execute({
            orderId: order.id.value,
            customerId: customer.id.value
        });

        expect(result.isRight()).toBe(true);
    });

    it('should not cancel an order already in PREPARING status', async () => {
        const customer = await makeCustomer(customerRepository)
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1')
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value)
        const order = await makeOrder(orderRepository, customer.id.value, restaurant.id.value, menuItem.id.value)
        order.confirm()
        order.startPreparing()
        await orderRepository.save(order)

        const result = await sut.execute({
            orderId: order.id.value,
            customerId: customer.id.value
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(OrderCannotBeCancelledError)
        }
    });

    it('should not cancel an already cancelled order', async () => {
        const customer = await makeCustomer(customerRepository)
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1')
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value)
        const order = await makeOrder(orderRepository, customer.id.value, restaurant.id.value, menuItem.id.value)
        order.cancel()
        await orderRepository.save(order)

        const result = await sut.execute({
            orderId: order.id.value,
            customerId: customer.id.value
        });

        expect(result.isLeft()).toBe(true)
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(OrderAlreadyCancelledError)
        }
    });

    it('should not allow a different customer to cancel the order', async () => {
        const customer = await makeCustomer(customerRepository)
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1')
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value)
        const order = await makeOrder(orderRepository, customer.id.value, restaurant.id.value, menuItem.id.value)

        const result = await sut.execute({
            orderId: order.id.value,
            customerId: 'another-customer-id'
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(NotAllowedError)
        }
    });

    it('should return error for a non-existent order', async () => {
        const result = await sut.execute({
            orderId: 'non-existent-order',
            customerId: 'any-id'
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    })
})