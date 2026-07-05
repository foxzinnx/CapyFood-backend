import { ListCustomerOrdersUseCase } from "@/application/use-cases/list-customer-orders/list-customer-orders.use-case.js"
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
let sut: ListCustomerOrdersUseCase

describe('ListCustomerOrdersUseCase', () => {
    beforeEach(() => {
        customerRepository = new InMemoryCustomerRepository();
        restaurantRepository = new InMemoryRestaurantRepository();
        menuItemRepository = new InMemoryMenuItemRepository();
        orderRepository = new InMemoryOrderRepository();
        sut = new ListCustomerOrdersUseCase(customerRepository, orderRepository);
    });

    it('should list orders for a specific customer', async () => {
        const customer = await makeCustomer(customerRepository)
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1')
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value)
        await makeOrder(orderRepository, customer.id.value, restaurant.id.value, menuItem.id.value)
        await makeOrder(orderRepository, customer.id.value, restaurant.id.value, menuItem.id.value)

        const result = await sut.execute({ customerId: customer.id.value });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.orders).toHaveLength(2);
            expect(result.value.total).toBe(2);
        }
    });

    it('should not return orders from other customers', async () => {
        const customer1 = await makeCustomer(customerRepository, { email: 'c1@example.com', cpf: '52998224725' })
        const customer2 = await makeCustomer(customerRepository, { email: 'c2@example.com', cpf: '71428793860' })
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1')
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value)
        await makeOrder(orderRepository, customer1.id.value, restaurant.id.value, menuItem.id.value)
        await makeOrder(orderRepository, customer2.id.value, restaurant.id.value, menuItem.id.value)

        const result = await sut.execute({ customerId: customer1.id.value });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.orders).toHaveLength(1);
        }
    });

    it('should paginate results', async () => {
        const customer = await makeCustomer(customerRepository)
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1')
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value)

        for(let i = 0; i < 5; i++){
            await makeOrder(orderRepository, customer.id.value, restaurant.id.value, menuItem.id.value);
        }

        const result = await sut.execute({ customerId: customer.id.value, page: 1, perPage: 2 });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.orders).toHaveLength(2);
            expect(result.value.total).toBe(5);
            expect(result.value.totalPages).toBe(3)
        }
    });

    it('should return error for a non-existent customer', async () => {
        const result = await sut.execute({ customerId: 'non-existent-id' });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    })
})