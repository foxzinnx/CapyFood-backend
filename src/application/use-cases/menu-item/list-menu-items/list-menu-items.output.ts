import type { MenuItemOutputDTO } from "@/domain/entities/menu-item.entity.js";
import type { MenuSectionOutputDTO } from "../../menu-section/menu-section.output.js";

export interface MenuSectionWithItems extends MenuSectionOutputDTO {
    items: MenuItemOutputDTO[];
}

export interface ListMenuItemsOutput {
    sections: MenuSectionWithItems[];
    unsectioned: MenuItemOutputDTO[];
}