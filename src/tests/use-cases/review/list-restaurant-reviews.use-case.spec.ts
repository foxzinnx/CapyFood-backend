import { ListRestaurantReviewsUseCase } from "@/application/use-cases/review/list-restaurant-reviews/list-restaurant-reviews.use-case.js"
import { Restaurant } from "@/domain/entities/restaurant.entity.js"
import { Review } from "@/domain/entities/review.entity.js"
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js"
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js"
import { InMemoryRestaurantRepository } from "@/tests/repositories/in-memory-restaurant.repository.js"
import { InMemoryReviewRepository } from "@/tests/repositories/in-memory-review.repository.js"
import { beforeEach, describe, expect, it } from "vitest"

let restaurantRepository: InMemoryRestaurantRepository
let reviewRepository: InMemoryReviewRepository
let sut: ListRestaurantReviewsUseCase
 
async function makeRestaurant(
    restaurantRepository: InMemoryRestaurantRepository,
): Promise<Restaurant> {
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
 
async function makeReview(
    reviewRepository: InMemoryReviewRepository,
    restaurantId: string,
    rating: number,
): Promise<Review> {
    const review = Review.create({
        customerId: new UniqueEntityId(),
        restaurantId: new UniqueEntityId(restaurantId),
        rating,
        description: 'Boa!',
    })
    await reviewRepository.create(review)
    return review
}

describe('ListRestaurantReviewsUseCase', () => {
    beforeEach(() => {
        restaurantRepository = new InMemoryRestaurantRepository();
        reviewRepository = new InMemoryReviewRepository();
        sut = new ListRestaurantReviewsUseCase(restaurantRepository, reviewRepository)
    });

    it('should list reviews for a restaurant', async () => {
        const restaurant = await makeRestaurant(restaurantRepository)
        await makeReview(reviewRepository, restaurant.id.value, 5)
        await makeReview(reviewRepository, restaurant.id.value, 4)

        const result = await sut.execute({ restaurantId: restaurant.id.value });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.reviews).toHaveLength(2);
            expect(result.value.total).toBe(2);
        }
    });

    it('should include the rating summary', async () => {
        const restaurant = await makeRestaurant(restaurantRepository)
        await makeReview(reviewRepository, restaurant.id.value, 5)
        await makeReview(reviewRepository, restaurant.id.value, 3)

        const result = await sut.execute({ restaurantId: restaurant.id.value });

        expect(result.isRight()).toBe(true)
        if (result.isRight()) {
            expect(result.value.summary.average).toBe(4)
            expect(result.value.summary.total).toBe(2)
            expect(result.value.summary.distribution[5]).toBe(1)
            expect(result.value.summary.distribution[3]).toBe(1)
        }
    });

    it('should return summary with average 0 when there are no reviews', async () => {
        const restaurant = await makeRestaurant(restaurantRepository)
 
        const result = await sut.execute({ restaurantId: restaurant.id.value })
 
        expect(result.isRight()).toBe(true)
        if (result.isRight()) {
            expect(result.value.summary.average).toBe(0)
            expect(result.value.summary.total).toBe(0)
            expect(result.value.reviews).toEqual([])
        }
    });

    it('should not return reviews from other restaurants', async () => {
        const restaurant1 = await makeRestaurant(restaurantRepository)
        const restaurant2 = await makeRestaurant(restaurantRepository)
        await makeReview(reviewRepository, restaurant1.id.value, 5)
        await makeReview(reviewRepository, restaurant2.id.value, 1)
 
        const result = await sut.execute({ restaurantId: restaurant1.id.value })
 
        expect(result.isRight()).toBe(true)
        if (result.isRight()) {
            expect(result.value.reviews).toHaveLength(1)
            expect(result.value.summary.total).toBe(1)
        }
    });

    it('should paginate the reviews', async () => {
        const restaurant = await makeRestaurant(restaurantRepository)
        for (let i = 0; i < 5; i++) {
            await makeReview(reviewRepository, restaurant.id.value, 5)
        }
 
        const result = await sut.execute({
            restaurantId: restaurant.id.value,
            page: 1,
            perPage: 2,
        })
 
        expect(result.isRight()).toBe(true)
        if (result.isRight()) {
            expect(result.value.reviews).toHaveLength(2)
            expect(result.value.total).toBe(5)
            expect(result.value.totalPages).toBe(3)
            expect(result.value.summary.total).toBe(5)
        }
    });

    it('should return error for a non-existent restaurant', async () => {
        const result = await sut.execute({ restaurantId: 'non-existent-id' })
 
        expect(result.isLeft()).toBe(true)
        if (result.isLeft()) {
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    });
})
