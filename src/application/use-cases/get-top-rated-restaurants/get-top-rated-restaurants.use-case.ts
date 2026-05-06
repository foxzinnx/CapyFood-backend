import type { RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";
import type { ReviewRepository } from "@/domain/repositories/review.repository.js";
import { right, type Either } from "@/shared/either.js";
import type { GetTopRatedRestaurantsOutput } from "./get-top-rated-restaurants.output.js";
import type { GetTopRatedRestaurantsInput } from "./get-top-rated-restaurants.input.js";
import type { TopRatedRestaurantItem } from "./top-rated-restaurant-item.js";

type GetTopRatedRestaurantsResult = Either<never, GetTopRatedRestaurantsOutput>;

export class GetTopRatedRestaurantsUseCase{
    private static readonly DEFAULT_LIMIT = 10;
    private static readonly MAX_LIMIT = 30;

    constructor(
        private readonly restaurantRepository: RestaurantRepository,
        private readonly reviewRepository: ReviewRepository
    ){}

    async execute(input: GetTopRatedRestaurantsInput): Promise<GetTopRatedRestaurantsResult>{
        const limit = Math.min(
            input.limit ?? GetTopRatedRestaurantsUseCase.DEFAULT_LIMIT,
            GetTopRatedRestaurantsUseCase.MAX_LIMIT
        );

        const restaurants = await this.restaurantRepository.findTopRated(limit);

        const restaurantsWithRating: TopRatedRestaurantItem[] = await Promise.all(
            restaurants.map(async (restaurant) => {
                const summary = await this.reviewRepository.getRatingSummary(
                    restaurant.id.value
                )

                return {
                    ...restaurant.toOutputDTO(),
                    averageRating: summary.average,
                    totalReviews: summary.total
                }
            })
        );

        return right({ restaurants: restaurantsWithRating });
    }
}