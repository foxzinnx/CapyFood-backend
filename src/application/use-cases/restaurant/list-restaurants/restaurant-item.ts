export interface RestaurantItem {
    id: string;
    name: string;
    description?: string | null;
    logoUrl?: string | null;
    city: string;
    state: string;
    isOpen: boolean;
}