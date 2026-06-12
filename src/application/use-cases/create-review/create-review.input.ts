export interface CreateReviewInput {
    customerId: string;
    restaurantId: string;
    rating: number;
    description?: string | undefined;
}