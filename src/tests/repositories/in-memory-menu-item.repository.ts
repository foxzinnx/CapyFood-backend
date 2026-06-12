import type { MenuItem } from "@/domain/entities/menu-item.entity.js";
import type { MenuItemRepository } from "@/domain/repositories/menu-item.repository.js";
import { randomUUID } from "node:crypto";

export class InMemoryMenuItemRepository implements MenuItemRepository {
    public items: MenuItem[] = [];
    public menus: { id: string; restaurantId: string }[] = [];
    
    async createMenuItem(item: MenuItem): Promise<void> {
        this.items.push(item);
    }

    async findMenuItemById(id: string): Promise<MenuItem | null> {
        return this.items.find((i) => i.id.value === id) ?? null;
    }

    async findMenuItemsByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
        const menu = this.menus.find((m) => m.restaurantId === restaurantId);
        if(!menu) return [];
        return this.items.filter((i) => i.menuId.value === menu.id);
    }

    async findMenuItemsByIds(ids: string[]): Promise<MenuItem[]> {
        return this.items.filter((i) => ids.includes(i.id.value));
    }

    async findFeatured(limit: number): Promise<MenuItem[]> {
        return this.items.filter((i) => i.isAvailable).slice(0, limit);
    }

    async findMenuIdByRestaurantId(restaurantId: string): Promise<string | null> {
        return this.menus.find((m) => m.restaurantId === restaurantId)?.id ?? null;
    }

    async createMenu(restaurantId: string): Promise<string> {
        const id = randomUUID();
        this.menus.push({ id, restaurantId });
        return id;
    }

    async saveMenuItem(item: MenuItem): Promise<void> {
        const index = this.items.findIndex((i) => i.id.value === item.id.value);
        if(index > 0) this.items[index] = item;
    }

    async deleteMenuItem(id: string): Promise<void> {
        this.items = this.items.filter((i) => i.id.value !== id);
    }

}