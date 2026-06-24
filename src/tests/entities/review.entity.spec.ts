import { Review } from "@/domain/entities/review.entity.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { describe, expect, it } from "vitest";

function makeReviewProps(overrides: Partial<{ rating: number; description?: string}> = {}){
    return {
        customerId: new UniqueEntityId(),
        restaurantId: new UniqueEntityId(),
        rating: overrides.rating ?? 5,
        description: overrides.description ?? 'Ótimo restaurante!'
    }
}

describe('Review', () => {
    describe('create', () => {
        it('should create a review with valid data', () => {
            const review = Review.create(makeReviewProps());

            expect(review.rating.value).toBe(5);
            expect(review.description).toBe('Ótimo restaurante!');
        });

        it('should set createdAt and updatedAt on creation', () => {
            const review = Review.create(makeReviewProps());

            expect(review.createdAt).toBeInstanceOf(Date);
            expect(review.updatedAt).toBeInstanceOf(Date);
        });

        it('should allow review without description', () => {
            const review = Review.create({
                customerId: new UniqueEntityId(),
                restaurantId: new UniqueEntityId(),
                rating: 5
            });

            expect(review.description).toBeNull();
        });

        it('should trim the description', () => {
            const review = Review.create(makeReviewProps({ description: '  Gostei da comida  ' }));

            expect(review.description).toBe('Gostei da comida');
        });

        it('should throw when rating is out of range', () => {
            expect(() => Review.create(makeReviewProps({ rating: 6 }))).toThrow();
        });

        it('should throw when rating is zero', () => {
            expect(() => Review.create(makeReviewProps({ rating: 0 }))).toThrow();
        });

        it('should throw when description exceeds 500 characters', () => {
            const longDescription = 'A'.repeat(501);

            expect(() => Review.create(makeReviewProps({description: longDescription }))).toThrow();
        });

        it('should accept description with exactly 500 characters', () => {
            const maxDescription = 'A'.repeat(500);

            const review = Review.create(makeReviewProps({ description: maxDescription }));

            expect(review.description).toBe(maxDescription);
        });
    });

    describe('update', () => {
        it('should update the rating', () => {
            const review = Review.create(makeReviewProps());

            review.changeRating(2);

            expect(review.rating.value).toBe(2);
        });

        it('should update the description', () => {
            const review = Review.create(makeReviewProps());

            review.changeDescription('Mudei de opinião');

            expect(review.description).toBe('Mudei de opinião');
        });

        it('should set description to null when explicitly passed as null', () => {
            const review = Review.create(makeReviewProps());

            review.changeDescription(null);

            expect(review.description).toBeNull();
        });

        it('should keep current rating when not provided in update', () => {
            const review = Review.create(makeReviewProps({ rating: 4 }));

            review.changeDescription('Apenas mudando a descrição :)');

            expect(review.rating.value).toBe(4);
        });

        it('should throw when updating to an invalid rating', () => {
            const review = Review.create(makeReviewProps());

            expect(() => review.changeRating(10)).toThrow()
        });

        it('should throw when updating to a description over the limit', () => {
            const review = Review.create(makeReviewProps());
            const longDescription = 'A'.repeat(501);

            expect(() => review.changeDescription(longDescription)).toThrow();
        });

        it('should update updatedAt', async () => {
            const review = Review.create(makeReviewProps());
            const previousUpdatedAt = review.updatedAt;

            await new Promise((resolve) => setTimeout(resolve, 5));
            review.changeRating(2);

            expect(review.updatedAt.getTime()).toBeGreaterThan(previousUpdatedAt.getTime());
        });
    });

    describe('toOutputDTO', () => {
        it('should return rating as a primitive number', () => {
            const review = Review.create(makeReviewProps({ rating: 4 }));

            const dto = review.toOutputDTO();

            expect(typeof dto.rating).toBe('number');
            expect(dto.rating).toBe(4);
        })
    })
})