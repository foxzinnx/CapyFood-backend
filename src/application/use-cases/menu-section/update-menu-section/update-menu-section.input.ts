export interface UpdateMenuSectionInput {
    sectionId: string;
    ownerId: string;
    name?: string;
    description?: string | null;
    isActive?: boolean;
}