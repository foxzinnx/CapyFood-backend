import { UpdateReviewUseCase } from "@/application/use-cases/update-review/update-review.use-case.js"
import { Review } from "@/domain/entities/review.entity.js";
import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { InMemoryReviewRepository } from "@/tests/repositories/in-memory-review.repository.js"
import { beforeEach, describe, expect, it } from "vitest";

let reviewRepository: InMemoryReviewRepository
let sut: UpdateReviewUseCase

async function makeReview(
    reviewRepository: InMemoryReviewRepository,
    customerId: string,
    overrides: Partial<{ rating: number; description: string }> = {},
): Promise<Review> {
    const review = Review.create({
        customerId: new UniqueEntityId(customerId),
        restaurantId: new UniqueEntityId(),
        rating: overrides.rating ?? 5,
        description: overrides.description ?? 'Ótima comida!',
    })
    await reviewRepository.create(review)
    return review
}

describe('UpdateReviewUseCase', () => {
    beforeEach(() => {
        reviewRepository = new InMemoryReviewRepository();
        sut = new UpdateReviewUseCase(reviewRepository)
    });

    it('should update the rating', async () => {
        const review = await makeReview(reviewRepository, 'customer-1');

        const result = await sut.execute({
            reviewId: review.id.value,
            customerId: 'customer-1',
            rating: 5
        });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.rating).toBe(5);
        }
        expect(reviewRepository.items[0]?.rating.value).toBe(5);
    });

    it('should update the description', async () => {
        const review = await makeReview(reviewRepository, 'customer-1');

        const result = await sut.execute({
            reviewId: review.id.value,
            customerId: 'customer-1',
            description: 'Mudei de ideia'
        });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.description).toBe('Mudei de ideia')
        }
    });

    it('should update the description', async () => {
        const review = await makeReview(reviewRepository, 'customer-1');

        const result = await sut.execute({
            reviewId: review.id.value,
            customerId: 'customer-1',
            description: 'Mudei de ideia'
        });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.description).toBe('Mudei de ideia')
        }
    });

    it('should set description to null when explicitly passed as null', async () => {
        const review = await makeReview(reviewRepository, 'customer-1');

        const result = await sut.execute({
            reviewId: review.id.value,
            customerId: 'customer-1',
            description: null,
        });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.description).toBeNull()
        }
    });

    it('should keep current values when only updating one field', async () => {
        const review = await makeReview(reviewRepository, 'customer-1', { rating: 4 });

        await sut.execute({
            reviewId: review.id.value,
            customerId: 'customer-1',
            description: 'Nova descrição'
        });

        expect(reviewRepository.items[0]?.rating.value).toBe(4);
    });

    it('should not allow a different customer to update the review', async () => {
        const review = await makeReview(reviewRepository, 'customer-1');

        const result = await sut.execute({
            reviewId: review.id.value,
            customerId: 'customer-2',
            rating: 1
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(NotAllowedError)
        }
    });

    it('should return error for a non-existent review', async () => {
        const result = await sut.execute({
            reviewId: 'non-existent-review',
            customerId: 'any-id',
            rating: 5
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    });

    it('should throw when updating to an invalid rating', async () => {
        const review = await makeReview(reviewRepository, 'customer-1');

        await expect(
            sut.execute({
                reviewId: review.id.value,
                customerId: 'customer-1',
                rating: 10
            })
        ).rejects.toThrow();
    })
})

