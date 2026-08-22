import { UpdateMenuSectionUseCase } from "@/application/use-cases/menu-section/update-menu-section/update-menu-section.use-case.js";
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
let sut: UpdateMenuSectionUseCase;

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

describe('UpdateMenuSectionUseCase', () => {
    beforeEach(() => {
        restaurantRepository = new InMemoryRestaurantRepository();
        menuSectionRepository = new InMemoryMenuSectionRepository();
        sut = new UpdateMenuSectionUseCase(restaurantRepository, menuSectionRepository);
    });

    it('should update the section name', async () => {
        const { section } = await setupRestaurantWithSection('owner-1');

        const result = await sut.execute({
            sectionId: section.id.value,
            ownerId: 'owner-1',
            name: 'Lançamentos'
        });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.name).toBe('Lançamentos');
        }
    });

    it('should update the description', async () => {
        const { section } = await setupRestaurantWithSection('owner-1');

        const result = await sut.execute({
            sectionId: section.id.value,
            ownerId: 'owner-1',
            description: 'New description'
        });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.description).toBe('New description');
        }
    });

    it('should set description to null when explicitly passed as null', async () => {
        const { section } = await setupRestaurantWithSection('owner-1');

        const result = await sut.execute({
            sectionId: section.id.value,
            ownerId: 'owner-1',
            description: null
        });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.description).toBeNull();
        }
    });

    it('should deactivate the section via isActive flag', async () => {
        const { section } = await setupRestaurantWithSection('owner-1');

        await sut.execute({
            sectionId: section.id.value,
            ownerId: 'owner-1',
            isActive: false
        });

        expect(menuSectionRepository.sections[0]?.isActive).toBe(false);
    });

    it('should activate the section via isActive flag', async () => {
        const { section } = await setupRestaurantWithSection('owner-1');
        await sut.execute({ sectionId: section.id.value, ownerId: 'owner-1', isActive: false });

        const result = await sut.execute({
            sectionId: section.id.value,
            ownerId: 'owner-1',
            isActive: true
        });

        expect(result.isRight()).toBe(true);
        expect(menuSectionRepository.sections[0]?.isActive).toBe(true);
    });

    it('should keep current values when only one field is updated', async () => {
        const { section } = await setupRestaurantWithSection('owner-1');

        await sut.execute({
            sectionId: section.id.value,
            ownerId: 'owner-1',
            name: 'Novo nome'
        });

        expect(menuSectionRepository.sections[0]?.description).toBe('Os melhores combos');
    });

    it('should not update a non-existent section', async () => {
        const result = await sut.execute({
            sectionId: 'non-existent-id',
            ownerId: 'owner-1',
            name: 'Lançamentos'
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    });

    it('should not allow a different owner to update the section', async () => {
        const { section } = await setupRestaurantWithSection('owner-1');

        const result = await sut.execute({
            sectionId: section.id.value,
            ownerId: 'owner-2',
            name: 'Lançamentos'
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(NotAllowedError)
        }

        expect(menuSectionRepository.sections[0]?.name.value).toBe('Combos do momento');
    });

    it('should throw when updating to an invalid name', async () => {
        const { section } = await setupRestaurantWithSection('owner-1');

        await expect(
            sut.execute({
                sectionId: section.id.value,
                ownerId: 'owner-1',
                name: 'A'
            })
        ).rejects.toThrow()
    });
})