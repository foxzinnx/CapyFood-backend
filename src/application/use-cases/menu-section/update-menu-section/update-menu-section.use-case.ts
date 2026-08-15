import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { left, right, type Either } from "@/shared/either.js";
import type { UpdateMenuSectionOutput } from "./update-menu-section.output.js";
import type { RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";
import type { MenuSectionRepository } from "@/domain/repositories/menu-section.repository.js";
import type { UpdateMenuSectionInput } from "./update-menu-section.input.js";

type UpdateMenuSectionResult = Either<
    ResourceNotFoundError | NotAllowedError,
    UpdateMenuSectionOutput
>

export class UpdateMenuSectionUseCase {
    constructor(
        private readonly restaurantRepository: RestaurantRepository,
        private readonly menuSectionRepository: MenuSectionRepository
    ){}

    async execute(input: UpdateMenuSectionInput): Promise<UpdateMenuSectionResult>{
        const section = await this.menuSectionRepository.findById(input.sectionId);
        if(!section){
            return left(new ResourceNotFoundError('Section'));
        }

        const restaurant = await this.restaurantRepository.findByMenuId(section.menuId.value);
        if(!restaurant){
            return left(new ResourceNotFoundError('Restaurant'));
        }

        if(restaurant.ownerId.value !== input.ownerId){
            return left(new NotAllowedError());
        }

        section.updateDetails({
            name: input.name,
            description: input.description
        });

        if(input.isActive !== undefined){
            input.isActive ? section.activate() : section.deactivate()
        }

        await this.menuSectionRepository.save(section);

        return right(section.toOutputDTO());
    }
}