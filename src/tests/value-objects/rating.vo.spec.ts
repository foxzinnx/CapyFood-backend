import { Rating } from "@/domain/value-objects/rating.vo.js";
import { describe, expect, it } from "vitest";

describe('Rating', () => {
    describe('create', () => {
        it('should create rating with value 1', () => {
            const rating = Rating.create(1);

            expect(rating.value).toBe(1);
        });

        it('should create rating with value 5', () => {
            const rating = Rating.create(5);

            expect(rating.value).toBe(5);
        });

        it('should create rating with values between 1 and 5', () => {
            const ratings = [1, 2, 3, 4, 5];

            ratings.forEach((value) => {
                const rating = Rating.create(value);
                expect(rating.value).toBe(value);
            })
        });

        it('should throw when rating is 0', () => {
            expect(() => Rating.create(0)).toThrow()
        });

        it('should throw when rating is 6', () => {
            expect(() => Rating.create(6)).toThrow();
        });

        it('should throw when rating is negative', () => {
            expect(() => Rating.create(-1)).toThrow();
        });

        it('should throw when rating is a decimal number', () => {
            expect(() => Rating.create(4.5)).toThrow();
        })
    });

    describe('toString', () => {
        it('should return "1 star" for rating 1', () => {
            const rating = Rating.create(1);

            expect(rating.toString()).toBe('1 star')
        });

        it('should return "5 stars" for rating 5', () => {
            const rating = Rating.create(5);

            expect(rating.toString()).toBe('5 stars');
        })
    });

    describe('equals', () => {
        it('should return true when two ratings have the same value', () => {
            const rating1 = Rating.create(1);
            const rating2 = Rating.create(1);

            expect(rating1.equals(rating2)).toBe(true);
        });

        it('should return false when two ratings have different values', () => {
            const rating1 = Rating.create(1);
            const rating2 = Rating.create(5);

            expect(rating1.equals(rating2)).toBe(false);
        })
    })
})