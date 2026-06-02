export interface CreateMenuItemInput {
    restaurantId: string;
    ownerId: string;
    name: string;
    description?: string | undefined;
    price: number;
    imageUrl?: string | undefined;
}
