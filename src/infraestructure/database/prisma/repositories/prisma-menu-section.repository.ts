import type { MenuSection } from "@/domain/entities/menu-section.entity.js";
import type { MenuSectionRepository } from "@/domain/repositories/menu-section.repository.js";
import { MenuSectionMapper } from "../mappers/menu-section.mapper.js";
import { prisma } from "../prisma.js";

export class PrismaMenuSectionRepository implements MenuSectionRepository {
    async create(section: MenuSection): Promise<void> {
        const data = MenuSectionMapper.toPrisma(section);
        await prisma.menuSection.create({ data });
    }

    async findById(id: string): Promise<MenuSection | null> {
        const raw = await prisma.menuSection.findUnique({ where: { id } });
        if(!raw) return null;

        return MenuSectionMapper.toDomain(raw);
    }
    
    async findByMenuId(menuId: string): Promise<MenuSection[]> {
        const raws = await prisma.menuSection.findMany({
            where: { menuId },
            orderBy: { createdAt: 'asc' }
        });
        return raws.map(MenuSectionMapper.toDomain);
    }

    async findByRestaurantId(restaurantId: string): Promise<MenuSection[]> {
        const raws = await prisma.menuSection.findMany({
            where: { menu: { restaurantId } },
            orderBy: { createdAt: 'asc' }
        });
        return raws.map(MenuSectionMapper.toDomain);
    }
    
    async save(section: MenuSection): Promise<void> {
        const data = MenuSectionMapper.toPrisma(section);
        await prisma.menuSection.update({
            where: { id: data.id },
            data
        });
    }

    async saveMany(sections: MenuSection[]): Promise<void> {
        await prisma.$transaction(
            sections.map((section) =>
                prisma.menuSection.updateMany({
                    where: { id: section.id.value },
                    data: {
                        position: section.position,
                        updatedAt: section.updatedAt
                    }
                })
            )
        )
    }

    async delete(id: string): Promise<void> {
        await prisma.menuSection.delete({ where: { id } });
    }

}