import { ReviewDescriptionTooLongError } from "../errors/review-description-too-long.error.js";
import { Rating } from "../value-objects/rating.vo.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";
import { Entity } from "./base.entity.js";

export interface ReviewProps {
    customerId: UniqueEntityId;
    restaurantId: UniqueEntityId;
    rating: Rating;
    description?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ReviewOutputDTO {
    id: string;
    customerId: string;
    restaurantId: string;
    rating: number;
    description?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export class Review extends Entity<ReviewProps>{
    private static readonly MAX_DESCRIPTION_LENGTH = 500;
    
    private constructor(props: ReviewProps, id?: UniqueEntityId){
        super(props, id);
    }

    static create(props: Omit<ReviewProps, 'createdAt' | 'updatedAt' | 'rating'> & { rating: number }, id?: UniqueEntityId): Review {
        const rating = Rating.create(props.rating);

        if(props.description){
            Review.validateDescription(props.description)
        }

        return new Review(
            {
                ...props,
                rating,
                description: props.description?.trim() ?? null,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            id
        )
    }

    static reconstitute(props: ReviewProps, id: UniqueEntityId): Review {
        return new Review(props, id);
    }

    get customerId(): UniqueEntityId { return this._props.customerId }
    get restaurantId(): UniqueEntityId { return this._props.restaurantId }
    get rating(): Rating { return this._props.rating }
    get description(): string | null { return this._props.description ?? null }
    get createdAt(): Date { return this._props.createdAt }
    get updatedAt(): Date { return this._props.updatedAt }

    changeRating(newRating: number): void {
        this._props.rating = Rating.create(newRating);
        this.touch();
    }

    changeDescription(newDescription: string | null | undefined): void {
        if(newDescription === undefined){
            return;
        }

        if(newDescription === null || newDescription.trim() === ''){
            this._props.description = null;
        } else {
            Review.validateDescription(newDescription);
            this._props.description = newDescription;
        }

        this.touch();
    }

    private static validateDescription(description: string): void {
        if(description.trim().length > Review.MAX_DESCRIPTION_LENGTH){
            throw new ReviewDescriptionTooLongError(Review.MAX_DESCRIPTION_LENGTH)
        }
    }

    toOutputDTO(): ReviewOutputDTO {
        return {
            id: this.id.value,
            customerId: this._props.customerId.value,
            restaurantId: this._props.restaurantId.value,
            rating: this._props.rating.value,
            description: this._props.description ?? null,
            createdAt: this._props.createdAt,
            updatedAt: this._props.updatedAt
        }
    }

    private touch(): void {
        this._props.updatedAt = new Date();
    }
}