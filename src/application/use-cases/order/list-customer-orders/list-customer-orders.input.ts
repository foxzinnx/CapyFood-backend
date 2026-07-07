export interface ListCustomerOrdersInput {
    customerId: string;
    page?: number | undefined;
    perPage?: number | undefined;
}