import { Customer } from "@/domain/entities/customer.entity.js";
import type { InMemoryCustomerRepository } from "../repositories/in-memory-customer.repository.js";
import { Email } from "@/domain/value-objects/email.vo.js";
import { CPF } from "@/domain/value-objects/cpf.vo.js";
import type { InMemoryRestaurantRepository } from "../repositories/in-memory-restaurant.repository.js";
import { Restaurant } from "@/domain/entities/restaurant.entity.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { InMemoryMenuItemRepository } from "../repositories/in-memory-menu-item.repository.js";
import { MenuItem } from "@/domain/entities/menu-item.entity.js";
import type { InMemoryOrderRepository } from "../repositories/in-memory-order.repository.js";
import { Order } from "@/domain/entities/order.entity.js";
import { OrderItem } from "@/domain/entities/order-item.entity.js";

export async function makeCustomer(
    customerRepository: InMemoryCustomerRepository,
    overrides: Partial<{ email: string; cpf: string }> = {}
): Promise<Customer> {
    const customer = Customer.create({
        name: 'Bryan Gomes',
        email: Email.create(overrides.email ?? 'bryan@example.com'),
        password: 'hashed-password',
        cpf: CPF.create(overrides.cpf ?? '52998224725'),
        phone: '11999999999',
        birthDate: new Date('1990-01-01')
    });
    await customerRepository.create(customer);
    return customer;
}

export async function makeRestaurant(
    restaurantRepository: InMemoryRestaurantRepository,
    ownerId: string,
    overrides: Partial<{ isOpen: boolean }> = {}
): Promise<Restaurant> {
    const restaurant = Restaurant.create({
        name: 'Capybara Pizza',
        description: 'As melhores pizzas da cidade',
        phone: '11999999999',
        address: 'Rua Bagre Guimaraes, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        isOpen: overrides.isOpen ?? true,
        ownerId: new UniqueEntityId(ownerId)
    });
    await restaurantRepository.create(restaurant);
    return restaurant;
}

export async function makeMenuItem(
    menuItemRepository: InMemoryMenuItemRepository,
    restaurantId: string,
    overrides: Partial<{ price: number; isAvailable: boolean }> = {}
): Promise<MenuItem> {
    const menuId = await menuItemRepository.createMenu(restaurantId);
    const item = MenuItem.create({
        name: 'Pizza de Pepperoni',
        description: 'Pizza muito boa',
        price: overrides.price ?? 39.9,
        isAvailable: overrides.isAvailable ?? true,
        menuId: new UniqueEntityId(menuId)
    });
    await menuItemRepository.createMenuItem(item);
    return item;
}

export async function makeOrder(
    orderRepository: InMemoryOrderRepository,
    customerId: string,
    restaurantId: string,
    menuItemId: string,
    overrides: Partial<{ quantity: number }> = {}
): Promise<Order> {
    const orderItem = OrderItem.create({
        menuItemId: new UniqueEntityId(menuItemId),
        menuItemName: 'Pizza de Pepperoni',
        quantity: overrides.quantity ?? 1,
        unitPrice: 39.9
    });
    const order = Order.create({
        customerId: new UniqueEntityId(customerId),
        restaurantId: new UniqueEntityId(restaurantId),
        items: [orderItem]
    });
    await orderRepository.create(order);
    return order;
}