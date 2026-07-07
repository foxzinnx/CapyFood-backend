import { DeleteReviewUseCase } from "@/application/use-cases/review/delete-review/delete-review.use-case.js";
import { Review } from "@/domain/entities/review.entity.js";
import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { InMemoryReviewRepository } from "@/tests/repositories/in-memory-review.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

let reviewRepository: InMemoryReviewRepository;
let sut: DeleteReviewUseCase;

async function makeReview(
    reviewRepository: InMemoryReviewRepository,
    customerId: string
): Promise<Review> {
    const review = Review.create({
        customerId: new UniqueEntityId(customerId),
        restaurantId: new UniqueEntityId(),
        rating: 5,
        description: 'Ótima comida!'
    });
    await reviewRepository.create(review);
    return review;
}

describe('DeleteReviewUseCase', () => {
    beforeEach(() => {
        reviewRepository = new InMemoryReviewRepository();
        sut = new DeleteReviewUseCase(reviewRepository)
    });

    it('should delete a review', async() => {
        const review = await makeReview(reviewRepository, 'customer-1');

        const result = await sut.execute({
            reviewId: review.id.value,
            customerId: 'customer-1'
        });

        expect(result.isRight()).toBe(true);
        expect(reviewRepository.items).toHaveLength(0);
    });

    it('should not allow a different customer to delete the review', async () => {
        const review = await makeReview(reviewRepository, 'customer-1');

        const result = await sut.execute({
            reviewId: review.id.value,
            customerId: 'customer-2'
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(NotAllowedError)
        }
        expect(reviewRepository.items).toHaveLength(1)
    });

    it('should return error for a non-existent review', async () => {
        const result = await sut.execute({
            reviewId: 'non-existent-id',
            customerId: 'any-id'
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    })
})