import { CreateOrderUseCase } from "@/application/use-cases/create-order/create-order.use-case.js";
import { MenuItemUnavailableError } from "@/domain/errors/menu-item-unavailable.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { RestaurantClosedError } from "@/domain/errors/restaurant-closed.error.js";
import { makeCustomer, makeMenuItem, makeRestaurant } from "@/tests/helpers/make-order-test-entities.js";
import { InMemoryCustomerRepository } from "@/tests/repositories/in-memory-customer.repository.js";
import { InMemoryMenuItemRepository } from "@/tests/repositories/in-memory-menu-item.repository.js";
import { InMemoryOrderRepository } from "@/tests/repositories/in-memory-order.repository.js";
import { InMemoryRestaurantRepository } from "@/tests/repositories/in-memory-restaurant.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

let customerRepository: InMemoryCustomerRepository;
let restaurantRepository: InMemoryRestaurantRepository;
let menuItemRepository: InMemoryMenuItemRepository;
let orderRepository: InMemoryOrderRepository;
let sut: CreateOrderUseCase;

describe('CreateOrderUseCase', () => {
    beforeEach(() => {
        customerRepository = new InMemoryCustomerRepository();
        restaurantRepository = new InMemoryRestaurantRepository();
        menuItemRepository = new InMemoryMenuItemRepository();
        orderRepository = new InMemoryOrderRepository();
        sut = new CreateOrderUseCase(
            customerRepository,
            restaurantRepository,
            menuItemRepository,
            orderRepository
        );
    });

    it('should create an order with valid data', async () => {
        const customer = await makeCustomer(customerRepository);
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1');
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value);

        const result = await sut.execute({
            customerId: customer.id.value,
            restaurantId: restaurant.id.value,
            items: [{ menuItemId: menuItem.id.value, quantity: 2 }]
        });

        expect(result.isRight()).toBe(true);
        expect(menuItemRepository.items).toHaveLength(1);
    });

    it('should calculate the total correctly', async () => {
        const customer = await makeCustomer(customerRepository);
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1');
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value, { price: 30 });

        const result = await sut.execute({
            customerId: customer.id.value,
            restaurantId: restaurant.id.value,
            items: [{ menuItemId: menuItem.id.value, quantity: 3 }]
        });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.total).toBe(90)
        }
    });

    it('should not create an order for a non-existent customer', async () => {
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1');
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value);

        const result = await sut.execute({
            customerId: 'non-existent-id',
            restaurantId: restaurant.id.value,
            items: [{ menuItemId: menuItem.id.value, quantity: 1 }]
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    });

    it('should not create an order for a non-existent restaurant', async () => {
        const customer = await makeCustomer(customerRepository);

        const result = await sut.execute({
            customerId: customer.id.value,
            restaurantId: 'any-id',
            items: [{ menuItemId: 'any-id', quantity: 1 }]
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    });

    it('should not create an order when the restaurant is close', async () => {
        const customer = await makeCustomer(customerRepository);
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1', { isOpen: false });
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value);

        const result = await sut.execute({
            customerId: customer.id.value,
            restaurantId: restaurant.id.value,
            items: [{ menuItemId: menuItem.id.value, quantity: 1 }]
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(RestaurantClosedError)
        }
    });

    it('should not create an order with an unavailable menu item', async () => {
        const customer = await makeCustomer(customerRepository);
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1');
        const menuItem = await makeMenuItem(menuItemRepository, restaurant.id.value, { isAvailable: false });

        const result = await sut.execute({
            customerId: customer.id.value,
            restaurantId: restaurant.id.value,
            items: [{ menuItemId: menuItem.id.value, quantity: 1 }]
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(MenuItemUnavailableError)
        }
    });

    it('should not create an order with a non-existent menu item', async () => {
        const customer = await makeCustomer(customerRepository);
        const restaurant = await makeRestaurant(restaurantRepository, 'owner-1');

        const result = await sut.execute({
            customerId: customer.id.value,
            restaurantId: restaurant.id.value,
            items: [{ menuItemId: 'non-existent-id', quantity: 1 }]
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    });
})