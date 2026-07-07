import { CannotReviewOwnRestaurantError } from "@/domain/errors/cannot-review-own-restaurant.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { ReviewAlreadyExistsError } from "@/domain/errors/review-already-exists.error.js";
import type { CustomerRepository } from "@/domain/repositories/customer.repository.js";
import type { RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";
import type { ReviewRepository } from "@/domain/repositories/review.repository.js";
import { left, right, type Either } from "@/shared/either.js";
import type { CreateReviewOutput } from "./create-review.output.js";
import type { CreateReviewInput } from "./create-review.input.js";
import { Review } from "@/domain/entities/review.entity.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

type CreateReviewResult = Either<
    ResourceNotFoundError | ReviewAlreadyExistsError | CannotReviewOwnRestaurantError,
    CreateReviewOutput
>

export class CreateReviewUseCase{
    constructor(
        private readonly customerRepository: CustomerRepository,
        private readonly restaurantRepository: RestaurantRepository,
        private readonly reviewRepository: ReviewRepository
    ){}

    async execute(input: CreateReviewInput): Promise<CreateReviewResult>{
        const customer = await this.customerRepository.findById(input.customerId);
        if(!customer){
            return left(new ResourceNotFoundError('Customer'));
        }

        const restaurant = await this.restaurantRepository.findById(input.restaurantId);
        if(!restaurant){
            return left(new ResourceNotFoundError('Restaurant'));
        }

        if(restaurant.ownerId.value === input.customerId){
            return left(new CannotReviewOwnRestaurantError());
        }

        const existingReview = await this.reviewRepository.findByCustomerAndRestaurant(input.customerId, input.restaurantId);
        if(existingReview){
            return left(new ReviewAlreadyExistsError());
        }

        const review = Review.create({
            customerId: new UniqueEntityId(input.customerId),
            restaurantId: new UniqueEntityId(input.restaurantId),
            rating: input.rating,
            description: input.description ?? null
        });

        await this.reviewRepository.create(review);

        return right(review.toOutputDTO());
    }
}