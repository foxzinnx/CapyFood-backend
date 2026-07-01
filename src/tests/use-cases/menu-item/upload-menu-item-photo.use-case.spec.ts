import { UploadMenuItemPhotoUseCase } from "@/application/use-cases/upload-menu-item-photo/upload-menu-item-photo.use-case.js";
import { MenuItem } from "@/domain/entities/menu-item.entity.js";
import { Restaurant } from "@/domain/entities/restaurant.entity.js";
import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { FakeStorageService } from "@/tests/fakes/fake-storage.js";
import { InMemoryMenuItemRepository } from "@/tests/repositories/in-memory-menu-item.repository.js";
import { InMemoryRestaurantRepository } from "@/tests/repositories/in-memory-restaurant.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

let restaurantRepository: InMemoryRestaurantRepository;
let menuItemRepository: InMemoryMenuItemRepository;
let storageService: FakeStorageService;
let sut: UploadMenuItemPhotoUseCase;

async function setupRestaurantWithMenuItem(ownerId: string){
    const restaurant = Restaurant.create({
        name: 'Capybara Pizza',
        description: 'As melhores pizzas da cidade',
        phone: '11999999999',
        address: 'Rua Aleatoria, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        isOpen: true,
        ownerId: new UniqueEntityId(ownerId)
    });
    await restaurantRepository.create(restaurant);

    const menuId = new UniqueEntityId();
    restaurantRepository.linkMenuToRestaurant(menuId.value, restaurant.id.value);

    const menuItem = MenuItem.create({
        name: 'Pizza de Calabresa',
        description: 'Pizza muito boa',
        price: 59.9,
        isAvailable: true,
        menuId
    });
    await menuItemRepository.createMenuItem(menuItem);

    return { restaurant, menuItem }
}

function makeFileInput(menuItemId: string, ownerId: string){
    return {
        menuItemId,
        ownerId,
        fileName: 'pizza.png',
        fileType: 'image/png',
        fileBuffer: Buffer.from('fake-image-content')
    }
}

describe('UploadMenuItemPhotoUseCase', () => {
    beforeEach(() => {
        restaurantRepository = new InMemoryRestaurantRepository();
        menuItemRepository = new InMemoryMenuItemRepository();
        storageService = new FakeStorageService();
        sut = new UploadMenuItemPhotoUseCase(
            restaurantRepository,
            menuItemRepository,
            storageService
        );
    });

    it('should upload a photo and update the menu item imageUrl', async () => {
        const { menuItem } = await setupRestaurantWithMenuItem('owner-1');

        const result = await sut.execute(makeFileInput(menuItem.id.value, 'owner-1'));

        expect(result.isRight()).toBe(true);
        expect(menuItemRepository.items[0]?.imageUrl).toContain('pizza.png');
    });

    it('should call storageService.upload with the menu-items folder', async () => {
        const { menuItem } = await setupRestaurantWithMenuItem('owner-1');

        await sut.execute(makeFileInput(menuItem.id.value, 'owner-1'));

        expect(storageService.uploads[0]?.folder).toBe('menu-items');
    });
    
    it('should delete the previous photo when uploading a new one', async () => {
        const { menuItem } = await setupRestaurantWithMenuItem('owner-1');
        await sut.execute(makeFileInput(menuItem.id.value, 'owner-1'));

        await sut.execute(makeFileInput(menuItem.id.value, 'owner1'));

        expect(storageService.deletedUrls).toEqual([]);
    });

    it('should reject an invalid file type', async () => {
        const { menuItem } = await setupRestaurantWithMenuItem('owner-1');

        const result = await sut.execute({
            ...makeFileInput(menuItem.id.value, 'owner-1'),
            fileType: 'application/pdf'
        });

        expect(result.isLeft()).toBe(true);
        expect(storageService.uploads).toHaveLength(0);
    });

    it('should not upload a photo for a non-existent menu-item', async () => {
        const result = await sut.execute(makeFileInput('non-existent-id', 'owner-1'));

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    });

    it('should not allow a different owner to upload a photo', async () => {
        const { menuItem } = await setupRestaurantWithMenuItem('owner-1');

        const result = await sut.execute(makeFileInput(menuItem.id.value, 'owner-2'));

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(NotAllowedError)
        }
    })
})