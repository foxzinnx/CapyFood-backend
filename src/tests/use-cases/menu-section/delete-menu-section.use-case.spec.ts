import { DeleteMenuSectionUseCase } from "@/application/use-cases/menu-section/delete-menu-section/delete-menu-section.use-case.js";
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
let sut: DeleteMenuSectionUseCase;

async function setupRestaurantWithSection(ownerId: string){
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

    const section = MenuSection.create({
        name: 'Combos do momento',
        description: 'Os melhores combos',
        position: 0,
        isActive: true,
        menuId
    });
    await menuSectionRepository.create(section);

    return { restaurant, section };
}

describe('DeleteMenuSectionUseCase', () => {
    beforeEach(() => {
        restaurantRepository = new InMemoryRestaurantRepository();
        menuSectionRepository = new InMemoryMenuSectionRepository();
        sut = new DeleteMenuSectionUseCase(restaurantRepository, menuSectionRepository);
    });

    it('should delete the section when the owner is the requester', async () => {
        const { section } = await setupRestaurantWithSection('owner-1');

        const result = await sut.execute({
            sectionId: section.id.value,
            ownerId: 'owner-1'
        });

        expect(result.isRight()).toBe(true);
        expect(menuSectionRepository.sections).toHaveLength(0);
    });

    it('should not find the section after deletion', async () => {
        const { section } = await setupRestaurantWithSection('owner-1');

        await sut.execute({
            sectionId: section.id.value,
            ownerId: 'owner-1'
        });

        const found = await menuSectionRepository.findById(section.id.value);
        expect(found).toBeNull();
    });

    it('should not delete a non-existent section', async () => {
        const result = await sut.execute({
            sectionId: 'non-existent-id',
            ownerId: 'owner-1'
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    });

    it('should return ResourceNotFoundError when the restaurant linked to the section menu does not exist', async () => {
        const menuId = new UniqueEntityId();
        const section = MenuSection.create({
            name: 'Combos do momento',
            description: 'Os melhores combos',
            position: 0,
            isActive: true,
            menuId
        });
        await menuSectionRepository.create(section);

        const result = await sut.execute({
            sectionId: section.id.value,
            ownerId: 'owner-1'
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
        expect(menuSectionRepository.sections).toHaveLength(1);
    });

    it('should not allow a different owner to delete the section', async () => {
        const { section } = await setupRestaurantWithSection('owner-1');

        const result = await sut.execute({
            sectionId: section.id.value,
            ownerId: 'owner-2'
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(NotAllowedError)
        }

        expect(menuSectionRepository.sections).toHaveLength(1);
    });

    it('should not remove other sections when deleting one', async () => {
        const { section: sectionToDelete } = await setupRestaurantWithSection('owner-1');

        const otherSection = MenuSection.create({
            name: 'Bebidas',
            description: 'Bebidas geladas',
            position: 1,
            isActive: true,
            menuId: sectionToDelete.menuId
        });
        await menuSectionRepository.create(otherSection);

        const result = await sut.execute({
            sectionId: sectionToDelete.id.value,
            ownerId: 'owner-1'
        });

        expect(result.isRight()).toBe(true);
        expect(menuSectionRepository.sections).toHaveLength(1);
        expect(menuSectionRepository.sections[0]?.id.value).toBe(otherSection.id.value)
    });
})