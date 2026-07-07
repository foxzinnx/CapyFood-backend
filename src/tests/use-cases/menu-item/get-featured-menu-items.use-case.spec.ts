import { GetFeaturedMenuItemsUseCase } from "@/application/use-cases/menu-item/get-featured-menu-items/get-featured-menu-items.use-case.js";
import { MenuItem } from "@/domain/entities/menu-item.entity.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { InMemoryMenuItemRepository } from "@/tests/repositories/in-memory-menu-item.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

let menuItemRepository: InMemoryMenuItemRepository;
let sut: GetFeaturedMenuItemsUseCase;

async function createItem(menuItemRepository: InMemoryMenuItemRepository, isAvailable = true){
    const item = MenuItem.create({
        name: 'Pizza de Calabresa',
        price: 49.9,
        isAvailable,
        menuId: new UniqueEntityId()
    })
    await menuItemRepository.createMenuItem(item);
    return item;
}

describe('GetFeaturedMenuItemsUseCase', () => {
    beforeEach(() => {
        menuItemRepository = new InMemoryMenuItemRepository();
        sut = new GetFeaturedMenuItemsUseCase(menuItemRepository)
    });

    it('should return featured items', async () => {
        await createItem(menuItemRepository);
        await createItem(menuItemRepository);

        const result = await sut.execute({});

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.menuItems).toHaveLength(2);
        }
    });

    it('should use default limit of 10 when not provided', async () => {
        for(let i = 0; i < 15; i++){
            await createItem(menuItemRepository)
        }

        const result = await sut.execute({});

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.menuItems).toHaveLength(10);
        }
    });

    it('should respect a custom limit', async () => {
        for(let i = 0; i < 5; i++){
            await createItem(menuItemRepository)
        }

        const result = await sut.execute({ limit: 3 });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.menuItems).toHaveLength(3);
        }
    });

    it('should cap the limit at the maximum allowed (30)', async () => {
        for(let i = 0; i < 40; i++){
            await createItem(menuItemRepository);
        }

        const result = await sut.execute({ limit: 1000 });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.menuItems.length).toBeLessThanOrEqual(30);
        }
    });

    it('should return an empty list when there are no items', async () => {
        const result = await sut.execute({});

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.menuItems).toEqual([]);
        }
    })
})