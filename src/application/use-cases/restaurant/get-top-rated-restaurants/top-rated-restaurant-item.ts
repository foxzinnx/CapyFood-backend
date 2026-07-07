import type { RestaurantOutputDTO } from "@/domain/entities/restaurant.entity.js";

export interface TopRatedRestaurantItem extends RestaurantOutputDTO {
    averageRating: number;
    totalReviews: number;
}