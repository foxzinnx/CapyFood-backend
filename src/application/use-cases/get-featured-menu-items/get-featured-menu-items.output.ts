import type { MenuItemOutputDTO } from "@/domain/entities/menu-item.entity.js";

export interface GetFeaturedMenuItemsOutput {
    menuItems: MenuItemOutputDTO[];
}