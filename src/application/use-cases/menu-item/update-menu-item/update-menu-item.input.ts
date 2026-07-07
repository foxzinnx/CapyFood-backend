export interface UpdateMenuItemInput{
    menuItemId: string;
    ownerId: string;
    name?: string | undefined;
    description?: string | null | undefined;
    price?: number | undefined;
    isAvailable?: boolean | undefined;
}