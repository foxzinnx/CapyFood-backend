import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import type { ReviewRepository } from "@/domain/repositories/review.repository.js";
import { left, right, type Either } from "@/shared/either.js";
import type { DeleteReviewInput } from "./delete-review.input.js";

type DeleteReviewResult = Either<
    ResourceNotFoundError | NotAllowedError, void
>

export class DeleteReviewUseCase{
    constructor(
        private readonly reviewRepository: ReviewRepository
    ){}

    async execute(input: DeleteReviewInput): Promise<DeleteReviewResult>{
        const review = await this.reviewRepository.findById(input.reviewId);
        if(!review){
            return left(new ResourceNotFoundError('Review'));
        }

        if(review.customerId.value !== input.customerId){
            return left(new NotAllowedError());
        }

        await this.reviewRepository.delete(input.reviewId);

        return right(undefined);
    }
}