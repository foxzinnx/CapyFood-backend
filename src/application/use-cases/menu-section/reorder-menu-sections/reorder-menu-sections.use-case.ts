import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { left, right, type Either } from "@/shared/either.js";
import type { ReorderMenuSectionsOutput } from "./reorder-menu-sections.output.js";
import type { RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";
import type { MenuSectionRepository } from "@/domain/repositories/menu-section.repository.js";
import type { ReorderMenuSectionsInput } from "./reorder-menu-sections.input.js";

type ReorderMenuSectionsResult = Either<
    ResourceNotFoundError | NotAllowedError,
    ReorderMenuSectionsOutput
>;

export class ReorderMenuSectionsUseCase {
    constructor(
        private readonly restaurantRepository: RestaurantRepository,
        private readonly menuSectionRepository: MenuSectionRepository
    ){}

    async execute(input: ReorderMenuSectionsInput): Promise<ReorderMenuSectionsResult>{
        const restaurant = await this.restaurantRepository.findById(input.restaurantId);
        if(!restaurant){
            return left(new ResourceNotFoundError('Restaurant'));
        }

        if(restaurant.ownerId.value !== input.ownerId){
            return left(new NotAllowedError());
        }

        const sections = await this.menuSectionRepository.findByRestaurantId(input.restaurantId);

        const sectionsIds = new Set(sections.map((s) => s.id.value));
        const invalidSection = input.sections.find((s) => !sectionsIds.has(s.sectionId));
        if(invalidSection){
            return left(new ResourceNotFoundError('Section'));
        }

        const updatedSections = sections.map((section) => {
            const newOrder = input.sections.find((s) => s.sectionId === section.id.value);
            if(newOrder){
                section.updatePosition(newOrder.position);
            }
            return section;
        });

        await this.menuSectionRepository.saveMany(updatedSections);

        return right({ restaurantId: input.restaurantId });
    }
}