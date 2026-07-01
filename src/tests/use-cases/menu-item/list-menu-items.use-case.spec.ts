import { ListMenuItemsUseCase } from "@/application/use-cases/list-menu-items/list-menu-items.use-case.js";
import { MenuItem } from "@/domain/entities/menu-item.entity.js";
import { Restaurant } from "@/domain/entities/restaurant.entity.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { InMemoryMenuItemRepository } from "@/tests/repositories/in-memory-menu-item.repository.js";
import { InMemoryRestaurantRepository } from "@/tests/repositories/in-memory-restaurant.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

let restaurantRepository: InMemoryRestaurantRepository;
let menuItemRepository: InMemoryMenuItemRepository;
let sut: ListMenuItemsUseCase;

describe('ListMenuItemsUseCase', () => {
    beforeEach(() => {
        restaurantRepository = new InMemoryRestaurantRepository();
        menuItemRepository = new InMemoryMenuItemRepository();
        sut = new ListMenuItemsUseCase(restaurantRepository, menuItemRepository);
    });

    it('should list all menu items of a restaurant', async () => {
        const restaurant = Restaurant.create({
            name: 'Capybara Pizza',
            description: 'As melhores pizzas da cidade',
            phone: '11999999999',
            address: 'Rua Aleatoria, 123',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234567',
            isOpen: true,
            ownerId: new UniqueEntityId()
        });
        await restaurantRepository.create(restaurant);

        const menuId = await menuItemRepository.createMenu(restaurant.id.value);
        await menuItemRepository.createMenuItem(
            MenuItem.create({
                name: 'Pizza de Calabresa',
                description: 'Pizza muito boa',
                price: 59.9,
                isAvailable: true,
                menuId: new UniqueEntityId(menuId)
            })
        )
        await menuItemRepository.createMenuItem(
            MenuItem.create({
                name: 'Pizza de Pepperoni',
                description: 'Pizza muito boa',
                price: 39.9,
                isAvailable: true,
                menuId: new UniqueEntityId(menuId)
            })
        )

        const result = await sut.execute({ restaurantId: restaurant.id.value });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.menuItems).toHaveLength(2);
        }
    });

    it('should return an empty list when restaurant has no menu yet', async () => {
        const restaurant = Restaurant.create({
            name: 'Capybara Pizza',
            description: 'As melhores pizzas da cidade',
            phone: '11999999999',
            address: 'Rua Aleatoria, 123',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234567',
            isOpen: true,
            ownerId: new UniqueEntityId()
        });
        await restaurantRepository.create(restaurant);

        const result = await sut.execute({ restaurantId: restaurant.id.value });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.menuItems).toEqual([]);
        }
    })
})