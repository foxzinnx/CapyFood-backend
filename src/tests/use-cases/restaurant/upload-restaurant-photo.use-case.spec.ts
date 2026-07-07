import { UploadRestaurantPhotoUseCase } from "@/application/use-cases/restaurant/upload-restaurant-photo/upload-restaurant-photo.use-case.js";
import { Restaurant } from "@/domain/entities/restaurant.entity.js";
import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { FakeStorageService } from "@/tests/fakes/fake-storage.js";
import { InMemoryRestaurantRepository } from "@/tests/repositories/in-memory-restaurant.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

let restaurantRepository: InMemoryRestaurantRepository;
let storageService: FakeStorageService;
let sut: UploadRestaurantPhotoUseCase;

async function createRestaurant(
    restaurantRepository: InMemoryRestaurantRepository,
    ownerId: string
){
    const restaurant = Restaurant.create({
        name: 'Capybara Pizza',
        description: 'As melhores pizzas da cidade',
        phone: '11999999999',
        address: 'Rua Bagre Guimaraes, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        isOpen: false,
        ownerId: new UniqueEntityId(ownerId)
    });
    await restaurantRepository.create(restaurant);
    return restaurant;
}

function makeFileInput(restaurantId: string, ownerId: string){
    return {
        restaurantId,
        ownerId,
        fileName: 'logo.png',
        fileType: 'image/png',
        fileBuffer: Buffer.from('fake-image-content')
    }
}

describe('UploadRestaurantPhotoUseCase', () => {
    beforeEach(() => {
        restaurantRepository = new InMemoryRestaurantRepository();
        storageService = new FakeStorageService();
        sut = new UploadRestaurantPhotoUseCase(restaurantRepository, storageService);
    });

    it('should upload a photo and update the restaurant logoUrl', async () => {
        const restaurant = await createRestaurant(restaurantRepository, 'owner-1');

        const result = await sut.execute(makeFileInput(restaurant.id.value, 'owner-1'));

        expect(result.isRight()).toBe(true);
        expect(restaurantRepository.items[0]?.logoUrl).toContain('logo.png')
    });

    it('should call storageService.upload with the correct folder', async () => {
        const restaurant = await createRestaurant(restaurantRepository, 'owner-1');

        await sut.execute(makeFileInput(restaurant.id.value, 'owner-1'));

        expect(storageService.uploads[0]?.folder).toBe('restaurants');
    });

    it('should delete the previous photo when uploading a new one', async () => {
        const restaurant = await createRestaurant(restaurantRepository, 'owner-1');
        await sut.execute(makeFileInput(restaurant.id.value, 'owner-1'));

        await sut.execute(makeFileInput(restaurant.id.value, 'owner-1'));

        expect(storageService.deletedUrls).toHaveLength(1);
    });

    it('should reject an invalid file type', async () => {
        const restaurant = await createRestaurant(restaurantRepository, 'owner-1');

        const result = await sut.execute({
            ...makeFileInput(restaurant.id.value, 'owner-1'),
            fileType: 'application/pdf'
        });

        expect(result.isLeft()).toBe(true);
        expect(storageService.uploads).toHaveLength(0);
    });

    it('should not upload a photo for a non-existent restaurant', async () => {
        const result = await sut.execute(makeFileInput('non-existent-id', 'owner-1'));

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    });

    it('should not allow a different owner to upload a photo', async () => {
        const restaurant = await createRestaurant(restaurantRepository, 'owner-1');

        const result = await sut.execute(makeFileInput(restaurant.id.value, 'owner-2'));

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(NotAllowedError)
        }
    })
})
