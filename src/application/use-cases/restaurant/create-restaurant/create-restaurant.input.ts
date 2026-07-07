export interface CreateRestaurantInput {
    ownerId: string;
    name: string;
    description?: string | undefined;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
}