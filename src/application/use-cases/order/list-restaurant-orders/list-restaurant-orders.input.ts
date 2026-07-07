export interface ListRestaurantOrdersInput{
    restaurantId: string;
    ownerId: string;
    page?: number | undefined;
    perPage?: number | undefined;
}