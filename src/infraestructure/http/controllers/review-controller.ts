import type { FastifyReply, FastifyRequest } from "fastify";
import { createReviewSchema, listReviewsQuerySchema, reviewIdSchema, reviewParamsSchema, updateReviewSchema } from "../schemas/review.schema.js";
import { createReviewUseCase, deleteReviewUseCase, listRestaurantReviewsUseCase, updateReviewUseCase } from "@/infraestructure/container/index.js";
import { handleError } from "../helpers/handle-error.js";

export class ReviewController {
    async createReview(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { restaurantId } = reviewParamsSchema.parse(request.params);
        const body = createReviewSchema.parse(request.body);
        const customerId = request.user.sub;

        const result = await createReviewUseCase.execute({
            customerId,
            restaurantId,
            ...body
        });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(201).send(result.value);
    }

    async updateReview(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { reviewId } = reviewIdSchema.parse(request.params);
        const body = updateReviewSchema.parse(request.body);
        const customerId = request.user.sub;

        const result = await updateReviewUseCase.execute({
            customerId,
            reviewId,
            ...body
        });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(200).send(result.value);
    }

    async deleteReview(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { reviewId } = reviewIdSchema.parse(request.params);
        const customerId = request.user.sub;

        const result = await deleteReviewUseCase.execute({ customerId, reviewId });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(204).send();
    }

    async listRestaurantReviews(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { restaurantId } = reviewParamsSchema.parse(request.params);
        const query = listReviewsQuerySchema.parse(request.query);

        const result = await listRestaurantReviewsUseCase.execute({
            restaurantId,
            ...query
        });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(200).send(result.value);
    }
}