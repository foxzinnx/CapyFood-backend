import { Review } from "@/domain/entities/review.entity.js";
import { Rating } from "@/domain/value-objects/rating.vo.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { Review as PrismaReview } from "@/generated/prisma/client.js";

export class ReviewMapper{
    static toDomain(raw: PrismaReview): Review {
        return Review.reconstitute(
            {
                customerId: new UniqueEntityId(raw.customerId),
                restaurantId: new UniqueEntityId(raw.restaurantId),
                rating: Rating.create(raw.rating),
                description: raw.description,
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt
            },
            new UniqueEntityId(raw.id)
        )
    }

    static toPrisma(review: Review){
        return {
            id: review.id.value,
            customerId: review.customerId.value,
            restaurantId: review.restaurantId.value,
            rating: review.rating.value,
            description: review.description ?? null,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt
        }
    }
}