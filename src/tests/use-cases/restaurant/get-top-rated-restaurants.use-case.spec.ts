import { GetTopRatedRestaurantsUseCase } from "@/application/use-cases/get-top-rated-restaurants/get-top-rated-restaurants.use-case.js";
import { Restaurant } from "@/domain/entities/restaurant.entity.js";
import { Review } from "@/domain/entities/review.entity.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { InMemoryRestaurantRepository } from "@/tests/repositories/in-memory-restaurant.repository.js";
import { InMemoryReviewRepository } from "@/tests/repositories/in-memory-review.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

let restaurantRepository: InMemoryRestaurantRepository;
let reviewRepository: InMemoryReviewRepository;
let sut: GetTopRatedRestaurantsUseCase;

async function createRestaurant(restaurantRepository: InMemoryRestaurantRepository){
    const restaurant = Restaurant.create({
        name: 'Capybara Pizza',
        description: 'As melhores pizzas da cidade',
        phone: '11999999999',
        address: 'Rua Bagre Guimaraes, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        isOpen: true,
        ownerId: new UniqueEntityId()
    });
    await restaurantRepository.create(restaurant);
    return restaurant;
}

describe('GetTopRatedRestaurantsUseCase', () => {
    beforeEach(() => {
        restaurantRepository = new InMemoryRestaurantRepository();
        reviewRepository = new InMemoryReviewRepository();
        sut = new GetTopRatedRestaurantsUseCase(restaurantRepository, reviewRepository)
    });

    it('should return restaurants with their rating summary', async () => {
        const restaurant = await createRestaurant(restaurantRepository);
        await reviewRepository.create(
            Review.create({
                customerId: new UniqueEntityId(),
                restaurantId: restaurant.id,
                rating: 5
            })
        )
        await reviewRepository.create(
            Review.create({
                customerId: new UniqueEntityId(),
                restaurantId: restaurant.id,
                rating: 4
            })
        )

        const result = await sut.execute({});

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.restaurants).toHaveLength(1);
            expect(result.value.restaurants[0]?.averageRating).toBe(4.5);
            expect(result.value.restaurants[0]?.totalReviews).toBe(2);
        }
    });

    it('should return averageRating 0 when restaurant has no reviews', async () => {
        await createRestaurant(restaurantRepository);

        const result = await sut.execute({});

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.restaurants[0]?.averageRating).toBe(0);
            expect(result.value.restaurants[0]?.totalReviews).toBe(0);
        }
    });

    it('should respect the limit parameter', async () => {
        for(let i = 0; i < 3; i++){
            await createRestaurant(restaurantRepository);
        }

        const result = await sut.execute({ limit: 2 });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.restaurants).toHaveLength(2);
        }
    });

    it('should return an empty list when there are no restaurants', async () => {
        const result = await sut.execute({});

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.restaurants).toEqual([]);
        }
    })
})