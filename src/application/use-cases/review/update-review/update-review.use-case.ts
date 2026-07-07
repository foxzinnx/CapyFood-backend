import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import type { ReviewRepository } from "@/domain/repositories/review.repository.js";
import { left, right, type Either } from "@/shared/either.js";
import type { UpdateReviewOutput } from "./update-review.output.js";
import type { UpdateReviewInput } from "./update-review.input.js";

type UpdateReviewResult = Either<
    ResourceNotFoundError | NotAllowedError,
    UpdateReviewOutput
>

export class UpdateReviewUseCase {
    constructor(
        private readonly reviewRepository: ReviewRepository
    ){}

    async execute(input: UpdateReviewInput): Promise<UpdateReviewResult>{
        const review = await this.reviewRepository.findById(input.reviewId);
        if(!review){
            return left(new ResourceNotFoundError('Review'));
        }

        if(review.customerId.value !== input.customerId){
            return left(new NotAllowedError())
        }

        if(input.rating){
            review.changeRating(input.rating);
        }

        if(input.description !== undefined){
            review.changeDescription(input.description);
        }

        await this.reviewRepository.save(review);

        return right(review.toOutputDTO());
    }
}