import type { Review } from "@/domain/entities/review.entity.js";
import type { ListReviewsFilters, PaginatedResult, RestaurantRatingSummary, ReviewRepository } from "@/domain/repositories/review.repository.js";

export class InMemoryReviewRepository implements ReviewRepository {
    public items: Review[] = [];

    async create(review: Review): Promise<void> {
        this.items.push(review);
    }

    async findById(id: string): Promise<Review | null> {
        return this.items.find((r) => r.id.value === id) ?? null;
    }

    async findByCustomerAndRestaurant(customerId: string, restaurantId: string): Promise<Review | null> {
        return (
            this.items.find(
                (r) =>
                    r.customerId.value === customerId &&
                    r.restaurantId.value === restaurantId
            ) ?? null
        )
    }

    async findByRestaurantId(restaurantId: string, filters: ListReviewsFilters): Promise<PaginatedResult<Review>> {
        const page = filters.page ?? 1;
        const perPage = filters.perPage ?? 20;

        const data = this.items.filter((r) => r.restaurantId.value === restaurantId);
        const total = data.length;
        const paginated = data.slice((page - 1) * perPage, page * perPage);

        return { 
            data: paginated,
            total, 
            page, 
            perPage, 
            totalPages: Math.ceil(total / perPage)
        }
    }

    async findByCustomerId(customerId: string, filters: ListReviewsFilters): Promise<PaginatedResult<Review>> {
        const page = filters.page ?? 1;
        const perPage = filters.perPage ?? 20;

        const data = this.items.filter((r) => r.customerId.value === customerId);
        const total = data.length;
        const paginated = data.slice((page - 1) * perPage, page * perPage);

        return { 
            data: paginated,
            total, 
            page, 
            perPage, 
            totalPages: Math.ceil(total / perPage)
        }
    }

    async getRatingSummary(restaurantId: string): Promise<RestaurantRatingSummary> {
        const reviews = this.items.filter((r) => r.restaurantId.value === restaurantId);

        const total = reviews.length;
        const average = total === 0 ? 0 : parseFloat((reviews.reduce((acc, r) => acc + r.rating.value, 0) / total).toFixed(1));

        const distribution: Record<number, number> = { 1:0, 2:0, 3:0, 4:0, 5:0 }
        reviews.forEach((r) => distribution[r.rating.value]!++);

        return {
            average,
            total,
            distribution
        }
    }

    async save(review: Review): Promise<void> {
        const index = this.items.findIndex((r) => r.id.value === review.id.value);
        if(index > 0) this.items[index] = review;
    }

    async delete(id: string): Promise<void> {
        this.items = this.items.filter((r) => r.id.value !== id);
    }

}