import { ReorderMenuSectionsUseCase } from "@/application/use-cases/menu-section/reorder-menu-sections/reorder-menu-sections.use-case.js";
import { MenuSection } from "@/domain/entities/menu-section.entity.js";
import { Restaurant } from "@/domain/entities/restaurant.entity.js";
import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { InMemoryMenuSectionRepository } from "@/tests/repositories/in-memory-menu-section.repository.js";
import { InMemoryRestaurantRepository } from "@/tests/repositories/in-memory-restaurant.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

let restaurantRepository: InMemoryRestaurantRepository;
let menuSectionRepository: InMemoryMenuSectionRepository;
let sut: ReorderMenuSectionsUseCase;

async function setupRestaurantWithSections(ownerId: string){
    const restaurant = Restaurant.create({
        name: 'Pizza Place',
        phone: '11999999999',
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        isOpen: true,
        ownerId: new UniqueEntityId(ownerId)
    });
    await restaurantRepository.create(restaurant);
 
    const menuId = new UniqueEntityId();
 
    restaurantRepository.linkMenuToRestaurant(menuId.value, restaurant.id.value);
    menuSectionRepository.linkMenuToRestaurant(menuId.value, restaurant.id.value);
 
    const sectionA = MenuSection.create({
        name: 'Combos do momento',
        description: 'Os melhores combos',
        position: 0,
        isActive: true,
        menuId
    });
    const sectionB = MenuSection.create({
        name: 'Bebidas',
        description: 'Bebidas geladas',
        position: 1,
        isActive: true,
        menuId
    });
    const sectionC = MenuSection.create({
        name: 'Sobremesas',
        description: 'Doces variados',
        position: 2,
        isActive: true,
        menuId
    });
 
    await menuSectionRepository.create(sectionA);
    await menuSectionRepository.create(sectionB);
    await menuSectionRepository.create(sectionC);
 
    return { restaurant, menuId, sectionA, sectionB, sectionC };
}

describe('ReorderMenuSectionsUseCase', () => {
    beforeEach(() => {
        restaurantRepository = new InMemoryRestaurantRepository();
        menuSectionRepository = new InMemoryMenuSectionRepository();
        sut = new ReorderMenuSectionsUseCase(restaurantRepository, menuSectionRepository);
    });

    it('should reorder the sections successfully', async () => {
        const { restaurant, sectionA, sectionB, sectionC } = await setupRestaurantWithSections('owner-1');

        const result = await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-1',
            sections: [
                { sectionId: sectionA.id.value, position: 2 },
                { sectionId: sectionB.id.value, position: 0 },
                { sectionId: sectionC.id.value, position: 1 }
            ]
        });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.restaurantId).toBe(restaurant.id.value)
        }
    });

    it('should update the positions of the sections', async () => {
        const { restaurant, sectionA, sectionB, sectionC } = await setupRestaurantWithSections('owner-1');

        await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-1',
            sections: [
                { sectionId: sectionA.id.value, position: 2 },
                { sectionId: sectionB.id.value, position: 0 },
                { sectionId: sectionC.id.value, position: 1 }
            ]
        });

        const updatedA = await menuSectionRepository.findById(sectionA.id.value);
        const updatedB = await menuSectionRepository.findById(sectionB.id.value);
        const updatedC = await menuSectionRepository.findById(sectionC.id.value);

        expect(updatedA?.position).toBe(2);
        expect(updatedB?.position).toBe(0);
        expect(updatedC?.position).toBe(1);
    });

    it('should keep the position of sections not included in the reorder list', async () => {
        const { restaurant, sectionA, sectionB, sectionC } = await setupRestaurantWithSections('owner-1');

        await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-1',
            sections: [
                { sectionId: sectionA.id.value, position: 5 }
            ]
        });

        const updatedA = await menuSectionRepository.findById(sectionA.id.value);
        const updatedB = await menuSectionRepository.findById(sectionB.id.value);
        const updatedC = await menuSectionRepository.findById(sectionC.id.value);

        expect(updatedA?.position).toBe(5);
        expect(updatedB?.position).toBe(1);
        expect(updatedC?.position).toBe(2);
    });

    it('should return ResourceNotFoundError when the restaurant does not exist', async () => {
        const result = await sut.execute({
            restaurantId: 'non-existent-restaurant',
            ownerId: 'owner-1',
            sections: []
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    });

    it('should not allow a different owner to reorder the sections', async () => {
        const { restaurant, sectionA, sectionB, sectionC } = await setupRestaurantWithSections('owner-1');

        const result = await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-2',
            sections: [
                { sectionId: sectionA.id.value, position: 4 },
                { sectionId: sectionB.id.value, position: 0 }
            ]
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(NotAllowedError)
        }

        const untouchedA = await menuSectionRepository.findById(sectionA.id.value);
        expect(untouchedA?.position).toBe(0);
    });

    it('should return ResourceNotFoundError when a section does not belong to the restaurant', async () => {
        const { restaurant, sectionA } = await setupRestaurantWithSections('owner-1');

        const result = await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-1',
            sections: [
                { sectionId: sectionA.id.value, position: 1 },
                { sectionId: 'non-existent-section', position: 0 }
            ]
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    });

    it('should not update any position when the reorder list contains an invalid section', async () => {
        const { restaurant, sectionA, sectionB } = await setupRestaurantWithSections('owner-1');

        await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-1',
            sections: [
                { sectionId: sectionA.id.value, position: 9 },
                { sectionId: 'non-existent-section', position: 0 }
            ]
        });

        const untouchedA = await menuSectionRepository.findById(sectionA.id.value);
        const untouchedB = await menuSectionRepository.findById(sectionB.id.value);

        expect(untouchedA?.position).toBe(0);
        expect(untouchedB?.position).toBe(1);
    });

    it('should not affect sections from other restaurants', async () => {
        const { restaurant, sectionA, sectionB } = await setupRestaurantWithSections('owner-1');
        const { sectionA: otherSectionA } = await setupRestaurantWithSections('owner-2');

        await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-1',
            sections: [
                { sectionId: sectionA.id.value, position: 1 },
                { sectionId: sectionB.id.value, position: 0 }
            ]
        });

        const untouchedOther = await menuSectionRepository.findById(otherSectionA.id.value);
        expect(untouchedOther?.position).toBe(0);
    })
})