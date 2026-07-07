import type { RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";
import type { ListRestaurantsInput } from "./list-restaurants.input.js";
import { right, type Either } from "@/shared/either.js";
import type { ListRestaurantsOutput } from "./list-restaurants.output.js";

type ListRestaurantsResult = Either<never, ListRestaurantsOutput>

export class ListRestaurantsUseCase{
    constructor(private readonly restaurantRepository: RestaurantRepository){}

    async execute(input: ListRestaurantsInput): Promise<ListRestaurantsResult>{
        const page = input.page ?? 1;
        const perPage = input.perPage ?? 20;

        const result = await this.restaurantRepository.list({
            search: input.search,
            city: input.city,
            isOpen: input.isOpen,
            page,
            perPage
        });

        return right({
            restaurants: result.data.map((restaurant) => ({
                id: restaurant.id.value,
                name: restaurant.name.value,
                description: restaurant.description,
                logoUrl: restaurant.logoUrl,
                city: restaurant.city,
                state: restaurant.state,
                isOpen: restaurant.isOpen
            })),
            total: result.total,
            page: result.page,
            perPage: result.perPage,
            totalPages: result.totalPages
        })
    }
}