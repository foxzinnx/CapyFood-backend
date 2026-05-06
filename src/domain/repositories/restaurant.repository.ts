import type { Restaurant } from "../entities/restaurant.entity.js";

export interface ListRestaurantsFilters {
    search?: string | undefined;
    city?: string | undefined;
    isOpen?: boolean | undefined;
    page?: number | undefined;
    perPage?: number | undefined;
}

export interface PaginatedResult<T>{
    data: T[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}

export interface RestaurantRepository {
    create(restaurant: Restaurant): Promise<void>;
    findById(id: string): Promise<Restaurant | null>;
    findByOwnerId(ownerId: string): Promise<Restaurant | null>;
    findByMenuId(menuId: string): Promise<Restaurant | null>;
    list(filters: ListRestaurantsFilters): Promise<PaginatedResult<Restaurant>>;
    findTopRated(limit: number): Promise<Restaurant[]>;
    save(restaurant: Restaurant): Promise<void>;
    delete(id: string): Promise<void>;
}