import { MenuSection } from "@/domain/entities/menu-section.entity.js";
import { Name } from "@/domain/value-objects/name.vo.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { MenuSection as PrismaMenuSection } from "@/generated/prisma/client.js";

export class MenuSectionMapper {
    static toDomain(raw: PrismaMenuSection): MenuSection {
        return MenuSection.reconstitute(
            {
                name: Name.create(raw.name),
                description: raw.description,
                position: raw.position,
                isActive: raw.isActive,
                menuId: new UniqueEntityId(raw.menuId),
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt
            },
            new UniqueEntityId(raw.id)
        )
    }

    static toPrisma(section: MenuSection){
        return {
            id: section.id.value,
            name: section.name.value,
            description: section.description,
            position: section.position,
            isActive: section.isActive,
            menuId: section.menuId.value,
            createdAt: section.createdAt,
            updatedAt: section.updatedAt
        }
    }
}