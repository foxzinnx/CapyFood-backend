import type { MenuItem } from "../entities/menu-item.entity.js";

export interface MenuItemRepository {
    createMenuItem(item: MenuItem): Promise<void>;
    findMenuItemById(id: string): Promise<MenuItem | null>;
    findMenuItemsByRestaurantId(restaurantId: string): Promise<MenuItem[]>;
    findMenuItemsByIds(ids: string[]): Promise<MenuItem[]>;
    findFeatured(limit: number): Promise<MenuItem[]>;
    findMenuIdByRestaurantId(restaurantId: string): Promise<string | null>;
    createMenu(restaurantId: string): Promise<string>;
    saveMenuItem(item: MenuItem): Promise<void>;
    deleteMenuItem(id: string): Promise<void>;
}