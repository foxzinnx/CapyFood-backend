export interface UpdateReviewInput {
    reviewId: string;
    customerId: string;
    rating?: number | undefined;
    description?: string | null | undefined;
}