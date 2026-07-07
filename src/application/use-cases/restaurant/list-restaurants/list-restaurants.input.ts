export interface ListRestaurantsInput {
    search?: string | undefined;
    city?: string | undefined;
    isOpen?: boolean | undefined;
    page?: number | undefined;
    perPage?: number | undefined;
}