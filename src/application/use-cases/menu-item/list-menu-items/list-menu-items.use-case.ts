import type { MenuItemRepository } from "@/domain/repositories/menu-item.repository.js";
import type { RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";
import type { ListMenuItemsInput } from "./list-menu-items.input.js";
import { left, right, type Either } from "@/shared/either.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import type { ListMenuItemsOutput } from "./list-menu-items.output.js";

type ListMenuItemsResult = Either<ResourceNotFoundError, ListMenuItemsOutput>

export class ListMenuItemsUseCase{
    constructor(
        private readonly restaurantRepository: RestaurantRepository,
        private readonly menuItemRepository: MenuItemRepository
    ){}

    async execute(input: ListMenuItemsInput): Promise<ListMenuItemsResult>{
        const restaurant = await this.restaurantRepository.findById(input.restaurantId);
        if(!restaurant){
            return left(new ResourceNotFoundError('Restaurant'));
        }

        const menuItems = await this.menuItemRepository.findMenuItemsByRestaurantId(input.restaurantId);

        return right({ menuItems: menuItems.map((item) => item.toOutputDTO())})
    }
}