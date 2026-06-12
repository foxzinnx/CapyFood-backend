import type { RestaurantOwner } from "@/domain/entities/restaurant-owner.entity.js";
import type { RestaurantOwnerRepository } from "@/domain/repositories/restaurant-owner.repository.js";

export class InMemoryRestaurantOwnerRepository implements RestaurantOwnerRepository {
    public items: RestaurantOwner[] = [];
    
    async create(owner: RestaurantOwner): Promise<void> {
        this.items.push(owner);
    }

    async findById(id: string): Promise<RestaurantOwner | null> {
        return this.items.find((o) => o.id.value === id) ?? null;
    }

    async findByEmail(email: string): Promise<RestaurantOwner | null> {
        return this.items.find((o) => o.email.value === email) ?? null;
    }

    async findByCnpj(cnpj: string): Promise<RestaurantOwner | null> {
        return this.items.find((o) => o.cnpj.value === cnpj) ?? null;
    }

    async save(owner: RestaurantOwner): Promise<void> {
        const index = this.items.findIndex((o) => o.id.value === owner.id.value);
        if(index > 0) this.items[index] = owner;
    }

}