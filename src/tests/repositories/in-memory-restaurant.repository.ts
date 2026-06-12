import type { Restaurant } from "@/domain/entities/restaurant.entity.js";
import type { ListRestaurantsFilters, PaginatedResult, RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";

export class InMemoryRestaurantRepository implements RestaurantRepository {
    public items: Restaurant[] = [];
    
    async create(restaurant: Restaurant): Promise<void> {
        this.items.push(restaurant);
    }

    async findById(id: string): Promise<Restaurant | null> {
        return this.items.find((r) => r.id.value === id) ?? null;
    }

    async findByOwnerId(ownerId: string): Promise<Restaurant | null> {
        return this.items.find((r) => r.ownerId.value === ownerId) ?? null;
    }

    async findByMenuId(menuId: string): Promise<Restaurant | null> {
        return null;
    }

    async list(filters: ListRestaurantsFilters): Promise<PaginatedResult<Restaurant>> {
        const page = filters.page ?? 1;
        const perPage = filters.perPage ?? 20;

        let data = [...this.items];

        if(filters.search){
            data = data.filter((r) => r.name.value.toLowerCase().includes(filters.search!.toLowerCase()))
        }

        if(filters.city){
            data = data.filter((r) => r.city.toLowerCase().includes(filters.city!.toLowerCase()))
        }

        if(filters.isOpen){
            data = data.filter((r) => r.isOpen === filters.isOpen)
        }

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

    async findTopRated(limit: number): Promise<Restaurant[]> {
        return this.items.slice(0, limit);
    }

    async save(restaurant: Restaurant): Promise<void> {
        const index = this.items.findIndex((r) => r.id.value === restaurant.id.value);
        if(index > 0) this.items[index] = restaurant;
    }

    async delete(id: string): Promise<void> {
        this.items = this.items.filter((r) => r.id.value !== id);
    }

}