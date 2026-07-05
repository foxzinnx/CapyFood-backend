import { GetOrderUseCase } from "@/application/use-cases/get-order/get-order.use-case.js"
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
let sut: GetOrderUseCase

describe('GetOrderUseCase', () => {
    beforeEach(() => {
        customerRepository = new InMemoryCustomerRepository();
        restaurantRepository = new InMemoryRestaurantRepository();
        menuItemRepository = new InMemoryMenuItemRepository();
        orderRepository = new InMemoryOrderRepository();
        sut = new GetOrderUseCase(orderRepository, restaurantRepository)
    });

    it('should allow the customer to get their own order', async () => {
        const customer = await makeCustomer(customerRepository);
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1');
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value);
        const order = await makeOrder(
            orderRepository,
            customer.id.value,
            restaurant.id.value,
            menuItem.id.value
        );

        const result = await sut.execute({
            orderId: order.id.value,
            requesterId: customer.id.value
        });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.id).toBe(order.id.value)
        }
    });

    it('should allow the restaurant owner to get an order from their restaurant', async () => {
        const customer = await makeCustomer(customerRepository);
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1');
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value);
        const order = await makeOrder(
            orderRepository,
            customer.id.value,
            restaurant.id.value,
            menuItem.id.value
        );

        const result = await sut.execute({
            orderId: order.id.value,
            requesterId: 'owner-1'
        });

        expect(result.isRight()).toBe(true);
    });

    it('should not allow a third party to get the order', async () => {
        const customer = await makeCustomer(customerRepository);
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1');
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value);
        const order = await makeOrder(
            orderRepository,
            customer.id.value,
            restaurant.id.value,
            menuItem.id.value
        );

        const result = await sut.execute({
            orderId: order.id.value,
            requesterId: 'stranger-id'
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(NotAllowedError)
        }
    });

    it('should return error for a non-existent order', async () => {
        const result = await sut.execute({
            orderId: 'non-existent-id',
            requesterId: 'any-id'
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    })
})