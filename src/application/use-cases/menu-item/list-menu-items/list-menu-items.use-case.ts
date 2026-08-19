import type { MenuItemRepository } from "@/domain/repositories/menu-item.repository.js";
import type { RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";
import type { ListMenuItemsInput } from "./list-menu-items.input.js";
import { left, right, type Either } from "@/shared/either.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import type { ListMenuItemsOutput, MenuSectionWithItems } from "./list-menu-items.output.js";
import type { MenuSectionRepository } from "@/domain/repositories/menu-section.repository.js";

type ListMenuItemsResult = Either<ResourceNotFoundError, ListMenuItemsOutput>

export class ListMenuItemsUseCase{
    constructor(
        private readonly restaurantRepository: RestaurantRepository,
        private readonly menuItemRepository: MenuItemRepository,
        private readonly menuSectionRepository: MenuSectionRepository
    ){}

    async execute(input: ListMenuItemsInput): Promise<ListMenuItemsResult>{
        const restaurant = await this.restaurantRepository.findById(input.restaurantId);
        if(!restaurant){
            return left(new ResourceNotFoundError('Restaurant'));
        }

        const [sections, items] = await Promise.all([
            this.menuSectionRepository.findByRestaurantId(input.restaurantId),
            this.menuItemRepository.findMenuItemsByRestaurantId(input.restaurantId)
        ]);

        const itemsWithSection = items.filter((item) => item.sectionId !== null);
        const unsectionedItems = items.filter((item) => item.sectionId === null);

        const sectionsWithItems: MenuSectionWithItems[] = sections
            .filter((section) => section.isActive)
            .sort((a, b) => a.position - b.position)
            .map((section) => ({
                ...section.toOutputDTO(),
                items: itemsWithSection
                    .filter((item) => item.sectionId?.value === section.id.value)
                    .map((item) => item.toOutputDTO())
            }))

        return right({
            sections: sectionsWithItems,
            unsectioned: unsectionedItems.map((item) => item.toOutputDTO())
        });
    }
}