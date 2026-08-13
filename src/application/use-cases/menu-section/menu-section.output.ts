export interface MenuSectionOutputDTO {
    id: string;
    name: string;
    description?: string | null;
    position: number;
    isActive: boolean;
    menuId: string;
    createdAt: Date;
    updatedAt: Date;
}