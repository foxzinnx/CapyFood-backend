export interface SectionOrderInput {
    sectionId: string;
    position: number;
}

export interface ReorderMenuSectionsInput {
    restaurantId: string;
    ownerId: string;
    sections: SectionOrderInput[];
}
