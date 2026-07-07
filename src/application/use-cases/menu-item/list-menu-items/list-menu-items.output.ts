import type { MenuItemOutputDTO } from "@/domain/entities/menu-item.entity.js";

export interface ListMenuItemsOutput {
    menuItems: MenuItemOutputDTO[];
}