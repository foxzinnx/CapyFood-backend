import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import type { RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";
import type { ReviewRepository } from "@/domain/repositories/review.repository.js";
import { left, right, type Either } from "@/shared/either.js";
import type { ListRestaurantReviewsOutput } from "./list-restaurant-reviews.output.js";
import type { ListRestaurantReviewsInput } from "./list-restaurant-reviews.input.js";

type ListRestaurantReviewsResult = Either<ResourceNotFoundError, ListRestaurantReviewsOutput>

export class ListRestaurantReviewsUseCase{
    constructor(
        private readonly restaurantRepository: RestaurantRepository,
        private readonly reviewRepository: ReviewRepository
    ){}

    async execute(input: ListRestaurantReviewsInput): Promise<ListRestaurantReviewsResult>{
        const restaurant = await this.restaurantRepository.findById(input.restaurantId);
        if(!restaurant){
            return left(new ResourceNotFoundError('Restaurant'));
        }

        const [result, summary] = await Promise.all([
            this.reviewRepository.findByRestaurantId(input.restaurantId, {
                page: input.page ?? 1,
                perPage: input.perPage ?? 20,
            }),
            this.reviewRepository.getRatingSummary(input.restaurantId)
        ]);

        return right({
            reviews: result.data.map((review) => review.toOutputDTO()),
            summary,
            total: result.total,
            page: result.page,
            perPage: result.perPage,
            totalPages: result.totalPages
        });
    }
}