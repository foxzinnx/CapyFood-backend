import type { MenuSection } from "@/domain/entities/menu-section.entity.js";
import type { MenuSectionRepository } from "@/domain/repositories/menu-section.repository.js";

export class InMemoryMenuSectionRepository implements MenuSectionRepository {
    public sections: MenuSection[] = [];

    private menus: { id: string; restaurantId: string }[];

    constructor(menus: { id: string; restaurantId: string }[] = []) {
        this.menus = menus;
    }

    linkMenuToRestaurant(menuId: string, restaurantId: string): void {
        this.menus.push({ id: menuId, restaurantId });
    }

    async create(section: MenuSection): Promise<void> {
        this.sections.push(section);
    }

    async findById(id: string): Promise<MenuSection | null> {
        return this.sections.find((s) => s.id.value === id) ?? null;
    }

    async findByMenuId(menuId: string): Promise<MenuSection[]> {
        return this.sections.filter((s) => s.menuId.value === menuId);
    }

    async findByRestaurantId(restaurantId: string): Promise<MenuSection[]> {
        const menu = this.menus.find((m) => m.restaurantId === restaurantId);
        if (!menu) return [];
        return this.sections.filter((s) => s.menuId.value === menu.id);
    }

    async save(section: MenuSection): Promise<void> {
        const index = this.sections.findIndex((s) => s.id.value === section.id.value);
        if (index >= 0) this.sections[index] = section;
    }

    async saveMany(sections: MenuSection[]): Promise<void> {
        for (const section of sections) {
            await this.save(section);
        }
    }

    async delete(id: string): Promise<void> {
        this.sections = this.sections.filter((s) => s.id.value !== id);
    }
}