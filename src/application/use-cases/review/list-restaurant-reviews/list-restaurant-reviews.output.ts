import type { ReviewOutputDTO } from "@/domain/entities/review.entity.js";
import type { RestaurantRatingSummary } from "@/domain/repositories/review.repository.js";

export interface ListRestaurantReviewsOutput {
    reviews: ReviewOutputDTO[];
    summary: RestaurantRatingSummary;
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}