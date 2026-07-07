import type { RestaurantItem } from "./restaurant-item.js";

export interface ListRestaurantsOutput{
    restaurants: RestaurantItem[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}