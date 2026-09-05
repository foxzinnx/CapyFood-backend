import type { Review } from "@/domain/entities/review.entity.js";
import type { ListReviewsFilters, PaginatedResult, RestaurantRatingSummary, ReviewRepository } from "@/domain/repositories/review.repository.js";
import { ReviewMapper } from "../mappers/review.mapper.js";
import { prisma } from "../prisma.js";

export class PrismaReviewRepository implements ReviewRepository {
    async create(review: Review): Promise<void> {
        const data = ReviewMapper.toPrisma(review);

        await prisma.review.create({ data });
    }

    async findById(id: string): Promise<Review | null> {
        const raw = await prisma.review.findUnique({
            where: { id }
        });

        if(!raw) return null;

        return ReviewMapper.toDomain(raw);
    }

    async findByCustomerAndRestaurant(customerId: string, restaurantId: string): Promise<Review | null> {
        const raw = await prisma.review.findUnique({
            where: { customerId_restaurantId: { customerId, restaurantId } }
        });

        if(!raw) return null;

        return ReviewMapper.toDomain(raw);
    }

    async findByRestaurantId(restaurantId: string, filters: ListReviewsFilters): Promise<PaginatedResult<Review>> {
        const page = filters.page ?? 1;
        const perPage = filters.perPage ?? 20;
        const skip = (page - 1) * perPage;

        const [raws, total] = await Promise.all([
            prisma.review.findMany({
                where: { restaurantId },
                skip,
                take: perPage,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.review.count({ where: { restaurantId } })
        ]);

        return {
            data: raws.map(ReviewMapper.toDomain),
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage)
        }
    }

    async findByCustomerId(customerId: string, filters: ListReviewsFilters): Promise<PaginatedResult<Review>> {
        const page = filters.page ?? 1;
        const perPage = filters.perPage ?? 20;
        const skip = (page - 1) * perPage;

        const [raws, total] = await Promise.all([
            prisma.review.findMany({
                where: { customerId },
                skip,
                take: perPage,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.review.count({ where: { customerId } })
        ]);

        return {
            data: raws.map(ReviewMapper.toDomain),
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage)
        }
    }

    async getRatingSummary(restaurantId: string): Promise<RestaurantRatingSummary> {
        const [aggregate, distribution] = await Promise.all([
            prisma.review.aggregate({
                where: { restaurantId },
                _avg: { rating: true },
                _count: { rating: true }
            }),

            prisma.review.groupBy({
                by: ['rating'],
                where: { restaurantId },
                _count: { rating: true }
            })
        ]);

        const distributionMap: Record<number, number> = { 1:0, 2:0, 3:0, 4:0, 5:0 }
        for(const group of distribution){
            distributionMap[group.rating] = group._count.rating
        }

        return {
            average: Number((aggregate._avg.rating ?? 0).toFixed(1)),
            total: aggregate._count.rating,
            distribution: distributionMap
        }
    }

    async save(review: Review): Promise<void> {
        const data = ReviewMapper.toPrisma(review);

        await prisma.review.update({
            where: { id: data.id },
            data
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.review.delete({ where: { id } });
    }

}