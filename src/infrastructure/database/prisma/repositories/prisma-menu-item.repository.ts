import type { MenuItem } from "@/domain/entities/menu-item.entity.js";
import type { MenuItemRepository } from "@/domain/repositories/menu-item.repository.js";
import { MenuItemMapper } from "../mappers/menu-item.mapper.js";
import { prisma } from "../prisma.js";

export class PrismaMenuItemRepository implements MenuItemRepository {
    async createMenuItem(item: MenuItem): Promise<void> {
        const data = MenuItemMapper.toPrisma(item);

        await prisma.menuItem.create({ data });
    }

    async findMenuItemById(id: string): Promise<MenuItem | null> {
        const raw = await prisma.menuItem.findUnique({
            where: { id }
        });

        if(!raw) return null;

        return MenuItemMapper.toDomain(raw);
    }

    async findMenuItemsByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
        const raws = await prisma.menuItem.findMany({
            where: { menu: { restaurantId } },
            orderBy: { createdAt: 'asc' }
        });

        return raws.map(MenuItemMapper.toDomain)
    }

    async findMenuItemsByIds(ids: string[]): Promise<MenuItem[]> {
        const raws = await prisma.menuItem.findMany({
            where: { id: { in: ids } }
        });

        return raws.map(MenuItemMapper.toDomain);
    }

    async findFeatured(limit: number): Promise<MenuItem[]> {
        const raws = await prisma.menuItem.findMany({
            where: { isAvailable: true },
            take: limit,
            orderBy: { createdAt: 'desc' }
        });

        return raws
            .sort(() => Math.random() - 0.5)
            .map(MenuItemMapper.toDomain)
    }

    async findMenuIdByRestaurantId(restaurantId: string): Promise<string | null> {
        const menu = await prisma.menu.findUnique({
            where: { restaurantId },
            select: { id: true }
        });

        return menu?.id ?? null
    }

    async createMenu(restaurantId: string): Promise<string> {
        const menu = await prisma.menu.create({
            data: { restaurantId },
            select: { id: true }
        });

        return menu.id
    }

    async saveMenuItem(item: MenuItem): Promise<void> {
        const data = MenuItemMapper.toPrisma(item);

        await prisma.menuItem.update({
            where: { id: data.id },
            data
        });
    }

    async deleteMenuItem(id: string): Promise<void> {
        await prisma.menuItem.delete({ where: { id } });
    }

}