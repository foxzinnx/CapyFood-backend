import type { MenuSection } from "../entities/menu-section.entity.js";

export interface MenuSectionRepository {
    create(section: MenuSection): Promise<void>;
    findById(id: string): Promise<MenuSection | null>;
    findByMenuId(menuId: string): Promise<MenuSection[]>;
    findByRestaurantId(restaurantId: string): Promise<MenuSection[]>;
    save(section: MenuSection): Promise<void>;
    saveMany(sections: MenuSection[]): Promise<void>;
    delete(id: string): Promise<void>;
}