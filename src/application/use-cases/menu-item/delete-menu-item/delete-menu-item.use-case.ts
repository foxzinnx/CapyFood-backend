import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import type { MenuItemRepository } from "@/domain/repositories/menu-item.repository.js";
import type { RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";
import { left, right, type Either } from "@/shared/either.js";
import type { DeleteMenuItemOutput } from "./delete-menu-item.output.js";
import type { DeleteMenuItemInput } from "./delete-menu-item.input.js";

type DeleteMenuItemResult = Either<
    ResourceNotFoundError | NotAllowedError,
    DeleteMenuItemOutput
>

export class DeleteMenuItemUseCase{
    constructor(
        private readonly restaurantRepository: RestaurantRepository,
        private readonly menuItemRepository: MenuItemRepository
    ){}

    async execute(input: DeleteMenuItemInput): Promise<DeleteMenuItemResult>{
        const menuItem = await this.menuItemRepository.findMenuItemById(input.menuItemId);
        if(!menuItem){
            return left(new ResourceNotFoundError('Menu item'));
        }

        const restaurant = await this.restaurantRepository.findByMenuId(menuItem.menuId.value);
        if(!restaurant){
            return left(new ResourceNotFoundError('Restaurant'));
        }

        if(restaurant.ownerId.value !== input.ownerId){
            return left(new NotAllowedError());
        }

        await this.menuItemRepository.deleteMenuItem(input.menuItemId);

        return right(undefined);
    }
}