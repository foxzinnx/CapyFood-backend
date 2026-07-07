import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import type { MenuItemRepository } from "@/domain/repositories/menu-item.repository.js";
import type { RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";
import { left, right, type Either } from "@/shared/either.js";
import type { CreateMenuItemOutput } from "./create-menu-item.output.js";
import type { CreateMenuItemInput } from "./create-menu-item.input.js";
import { MenuItem } from "@/domain/entities/menu-item.entity.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

type CreateMenuItemResult = Either<
    ResourceNotFoundError | NotAllowedError,
    CreateMenuItemOutput
>

export class CreateMenuItemUseCase{
    constructor(
        private readonly restaurantRepository: RestaurantRepository,
        private readonly menuItemRepository: MenuItemRepository
    ){}

    async execute(input: CreateMenuItemInput): Promise<CreateMenuItemResult>{
        const restaurant = await this.restaurantRepository.findById(input.restaurantId);
        if(!restaurant){
            return left(new ResourceNotFoundError('Restaurant'));
        }

        if(restaurant.ownerId.value !== input.ownerId){
            return left(new NotAllowedError());
        }

        let menuId = await this.menuItemRepository.findMenuIdByRestaurantId(input.restaurantId);
        if(!menuId){
            menuId = await this.menuItemRepository.createMenu(input.restaurantId);
        }

        const menuItem = MenuItem.create({
            name: input.name,
            description: input.description ?? null,
            price: input.price,
            imageUrl: input.imageUrl ?? null,
            isAvailable: true,
            menuId: new UniqueEntityId(menuId)
        });

        await this.menuItemRepository.createMenuItem(menuItem);

        return right({ menuItemId: menuItem.id.value });
    }
}