export interface UpdateMenuSectionInput {
    sectionId: string;
    ownerId: string;
    name?: string | undefined;
    description?: string | null | undefined;
    isActive?: boolean | undefined;
}