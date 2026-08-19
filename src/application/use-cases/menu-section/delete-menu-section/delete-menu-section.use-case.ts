import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import type { MenuSectionRepository } from "@/domain/repositories/menu-section.repository.js";
import type { RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";
import { left, right, type Either } from "@/shared/either.js";
import type { DeleteMenuSectionInput } from "./delete-menu-section.input.js";

type DeleteMenuSectionResult = Either<
    ResourceNotFoundError | NotAllowedError,
    void
>;

export class DeleteMenuSectionUseCase{
    constructor(
        private readonly restaurantRepository: RestaurantRepository,
        private readonly menuSectionRepository: MenuSectionRepository
    ){}

    async execute(input: DeleteMenuSectionInput): Promise<DeleteMenuSectionResult>{
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

        await this.menuSectionRepository.delete(input.sectionId);

        return right(undefined)
    }
}