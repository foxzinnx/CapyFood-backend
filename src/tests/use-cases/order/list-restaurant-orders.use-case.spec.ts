import { ListCustomerOrdersUseCase } from "@/application/use-cases/list-customer-orders/list-customer-orders.use-case.js"
import { ListRestaurantOrdersUseCase } from "@/application/use-cases/list-restaurant-orders/list-restaurant-orders.use-case.js"
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
let sut: ListRestaurantOrdersUseCase

describe('ListRestaurantOrdersUseCase', () => {
    beforeEach(() => {
        customerRepository = new InMemoryCustomerRepository();
        restaurantRepository = new InMemoryRestaurantRepository();
        menuItemRepository = new InMemoryMenuItemRepository();
        orderRepository = new InMemoryOrderRepository();
        sut = new ListRestaurantOrdersUseCase(restaurantRepository, orderRepository);
    });

    it('should list orders for a specific restaurant', async () => {
        const customer = await makeCustomer(customerRepository)
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1')
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value)
        await makeOrder(orderRepository, customer.id.value, restaurant.id.value, menuItem.id.value)
        await makeOrder(orderRepository, customer.id.value, restaurant.id.value, menuItem.id.value)

        const result = await sut.execute({ restaurantId: restaurant.id.value, ownerId: 'owner-1'});

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.orders).toHaveLength(2);
        }
    });

    it('should not return orders from other restaurants', async () => {
        const customer = await makeCustomer(customerRepository)
        const restaurant1 = await makeRestaurant(restaurantRepository, 'owner-1')
        const restaurant2 = await makeRestaurant(restaurantRepository, 'owner-2')
        const menuItem1 = await makeMenuItem(menuItemRepository, restaurant1.id.value)
        const menuItem2 = await makeMenuItem(menuItemRepository, restaurant2.id.value)
        await makeOrder(orderRepository, customer.id.value, restaurant1.id.value, menuItem1.id.value)
        await makeOrder(orderRepository, customer.id.value, restaurant2.id.value, menuItem2.id.value)

        const result = await sut.execute({ restaurantId: restaurant1.id.value, ownerId: 'owner-1' });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.orders).toHaveLength(1);
        }
    });

    it('should not allow a different owner to list orders', async () => {
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1');

        const result = await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-2'
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(NotAllowedError)
        }
    })

    it('should return error for a non-existent restaurant', async () => {
        const result = await sut.execute({ restaurantId: 'non-existent-id', ownerId: 'owner-1' });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    })
})