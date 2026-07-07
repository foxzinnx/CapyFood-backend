import { UpdateOrderStatusUseCase } from "@/application/use-cases/order/update-order-status/update-order-status.use-case.js"
import { InvalidOrderStatusTransitionError } from "@/domain/errors/invalid-order-status-transition.error.js"
import { NotAllowedError } from "@/domain/errors/not-allowed.error.js"
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
let sut: UpdateOrderStatusUseCase

describe('UpdateOrderStatusUseCase', () => {
    beforeEach(() => {
        customerRepository = new InMemoryCustomerRepository();
        restaurantRepository = new InMemoryRestaurantRepository();
        menuItemRepository = new InMemoryMenuItemRepository();
        orderRepository = new InMemoryOrderRepository();
        sut = new UpdateOrderStatusUseCase(orderRepository, restaurantRepository);
    });

    it('should confirm a pending order', async () => {
        const customer = await makeCustomer(customerRepository)
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1')
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value)
        const order = await makeOrder(orderRepository, customer.id.value, restaurant.id.value, menuItem.id.value)

        const result = await sut.execute({
            orderId: order.id.value,
            ownerId: 'owner-1',
            newStatus: 'CONFIRMED'
        });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.status).toBe('CONFIRMED')
        }
        expect(orderRepository.items[0]?.status).toBe('CONFIRMED');
    });

    it('should move through the full happy path', async () => {
        const customer = await makeCustomer(customerRepository)
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1')
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value)
        const order = await makeOrder(orderRepository, customer.id.value, restaurant.id.value, menuItem.id.value)

        const transitions: Array<'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERING' | 'DELIVERED'> = 
            ['CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED']

        for(const status of transitions){
            const result = await sut.execute({
                orderId: order.id.value,
                ownerId: 'owner-1',
                newStatus: status
            });
            expect(result.isRight()).toBe(true);
        }

        expect(orderRepository.items[0]?.status).toBe('DELIVERED')
    });

    it('should not allow an invalid status transition', async () => {
        const customer = await makeCustomer(customerRepository)
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1')
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value)
        const order = await makeOrder(orderRepository, customer.id.value, restaurant.id.value, menuItem.id.value)

        const result = await sut.execute({
            orderId: order.id.value,
            ownerId: 'owner-1',
            newStatus: 'DELIVERED'
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(InvalidOrderStatusTransitionError)
        }
    });

    it('should not allow a different owner to update the status', async () => {
        const customer = await makeCustomer(customerRepository)
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1')
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value)
        const order = await makeOrder(orderRepository, customer.id.value, restaurant.id.value, menuItem.id.value)

        const result = await sut.execute({
            orderId: order.id.value,
            ownerId: 'owner-2',
            newStatus: 'CONFIRMED'
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(NotAllowedError)
        }
    });

    it('should return error for a non-existent order', async () => {
        const result = await sut.execute({
            orderId: 'non-existent-id',
            ownerId: 'owner-1',
            newStatus: 'CONFIRMED'
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    });
})