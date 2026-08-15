import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import type { MenuItemRepository } from "@/domain/repositories/menu-item.repository.js";
import type { MenuSectionRepository } from "@/domain/repositories/menu-section.repository.js";
import type { RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";
import { left, right, type Either } from "@/shared/either.js";
import type { CreateMenuSectionOutput } from "./create-menu-section.output.js";
import type { CreateMenuSectionInput } from "./create-menu-section.input.js";
import { MenuSection } from "@/domain/entities/menu-section.entity.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

type CreateMenuSectionResult = Either<
    ResourceNotFoundError | NotAllowedError,
    CreateMenuSectionOutput
>

export class CreateMenuSectionUseCase{
    constructor(
        private readonly restaurantRepository: RestaurantRepository,
        private readonly menuItemRepository: MenuItemRepository,
        private readonly menuSectionRepository: MenuSectionRepository
    ){}

    async execute(input: CreateMenuSectionInput): Promise<CreateMenuSectionResult> {
        const restaurant = await this.restaurantRepository.findById(input.restaurantId);
        if(!restaurant){
            return left(new ResourceNotFoundError('Restaurant'));
        }

        if(restaurant.ownerId.value !== input.ownerId){
            return left(new NotAllowedError())
        }

        let menuId = await this.menuItemRepository.findMenuIdByRestaurantId(input.restaurantId);
        if(!menuId){
            menuId = await this.menuItemRepository.createMenu(input.restaurantId);
        }

        const existingSections = await this.menuSectionRepository.findByMenuId(menuId);
        const nextPosition = existingSections.length;

        const section = MenuSection.create({
            name: input.name,
            description: input.description ?? null,
            position: nextPosition,
            isActive: true,
            menuId: new UniqueEntityId(menuId)
        });

        await this.menuSectionRepository.create(section);

        return right(section.toOutputDTO());
    }
}