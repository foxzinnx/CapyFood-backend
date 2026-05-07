import { MenuItem } from "@/domain/entities/menu-item.entity.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { MenuItem as PrismaMenuItem } from "@/generated/prisma/client.js";

export class MenuItemMapper{
    static toDomain(raw: PrismaMenuItem): MenuItem {
        return MenuItem.create(
            {
                name: raw.name,
                description: raw.description,
                price: raw.price.toNumber(),
                imageUrl: raw.imageUrl,
                isAvailable: raw.isAvailable,
                menuId: new UniqueEntityId(raw.menuId),
            },
            new UniqueEntityId(raw.id)
        )
    }

    static toPrisma(item: MenuItem) {
        return {
            id: item.id.value,
            name: item.name.value,
            description: item.description ?? null,
            price: item.price,
            imageUrl: item.imageUrl ?? null,
            isAvailable: item.isAvailable,
            menuId: item.menuId.value,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
        }
    }
}