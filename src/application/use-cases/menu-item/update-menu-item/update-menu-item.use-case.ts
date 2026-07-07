import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import type { MenuItemRepository } from "@/domain/repositories/menu-item.repository.js";
import type { RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";
import { left, right, type Either } from "@/shared/either.js";
import type { UpdateMenuItemOutput } from "./update-menu-item.output.js";
import type { UpdateMenuItemInput } from "./update-menu-item.input.js";

type UpdateMenuItemResult = Either<
    ResourceNotFoundError | NotAllowedError,
    UpdateMenuItemOutput
>

export class UpdateMenuItemUseCase{
    constructor(
        private readonly restaurantRepository: RestaurantRepository,
        private readonly menuItemRepository: MenuItemRepository
    ){}

    async execute(input: UpdateMenuItemInput): Promise<UpdateMenuItemResult>{
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

        menuItem.updateDetails({
            name: input.name,
            description: input.description,
            price: input.price
        });

        if(input.isAvailable !== undefined){
            input.isAvailable ? menuItem.enable() : menuItem.disable();
        }

        await this.menuItemRepository.saveMenuItem(menuItem);

        return right({ menuItemId: menuItem.id.value })
    }
}