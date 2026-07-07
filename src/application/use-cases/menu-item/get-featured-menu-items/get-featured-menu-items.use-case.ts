import type { MenuItemRepository } from "@/domain/repositories/menu-item.repository.js";
import { right, type Either } from "@/shared/either.js";
import type { GetFeaturedMenuItemsOutput } from "./get-featured-menu-items.output.js";
import type { GetFeaturedMenuItemsInput } from "./get-featured-menu-items.input.js";

type GetFeaturedMenuItemsResult = Either<never, GetFeaturedMenuItemsOutput>

export class GetFeaturedMenuItemsUseCase{
    private static readonly DEFAULT_LIMIT = 10;
    private static readonly MAX_LIMIT = 30;

    constructor(
        private readonly menuItemRepository: MenuItemRepository
    ){}

    async execute(input: GetFeaturedMenuItemsInput): Promise<GetFeaturedMenuItemsResult>{
        const limit = Math.min(
            input.limit ?? GetFeaturedMenuItemsUseCase.DEFAULT_LIMIT,
            GetFeaturedMenuItemsUseCase.MAX_LIMIT
        );

        const menuItems = await this.menuItemRepository.findFeatured(limit);

        return right({
            menuItems: menuItems.map((item) => item.toOutputDTO())
        });
    }
}