import { InvalidRatingError } from "../errors/invalid-rating.error.js";

export class Rating {
    private static readonly MIN = 1
    private static readonly MAX = 5

    private readonly _value: number;

    private constructor(value: number){
        this._value = value;
    }

    static create(value: number): Rating {
        Rating.validate(value);

        return new Rating(value);
    }

    get value(): number {
        return this._value;
    }

    toString(): string {
        return this._value === 1 ? `${this._value} star` : `${this._value} stars`
    }

    equals(rating: Rating): boolean {
        return this._value === rating.value
    }

    private static validate(value: number): void{
        if(!Number.isInteger(value) || value < Rating.MIN || value > Rating.MAX){
            throw new InvalidRatingError(Rating.MIN, Rating.MAX)
        }
    }
}