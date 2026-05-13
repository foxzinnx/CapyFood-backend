import type { FastifyReply, FastifyRequest } from "fastify";
import { createRestaurantSchema, getTopRatedRestaurantsSchema, listRestaurantsSchema, restaurantIdSchema, updateRestaurantHoursSchema } from "../schemas/restaurant.schema.js";
import { createRestaurantUseCase, getRestaurantUseCase, getTopRatedRestaurantsUseCase, listRestaurantsUseCase, toggleRestaurantStatusUseCase, updateRestaurantHoursUseCase, uploadRestaurantPhotoUseCase } from "@/infraestructure/container/index.js";
import { handleError } from "../helpers/handle-error.js";

export class RestaurantController {
    async createRestaurant(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const body = createRestaurantSchema.parse(request.body);
        const ownerId = request.user.sub;

        const result = await createRestaurantUseCase.execute({ ownerId, ...body });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(201).send(result.value)
    }

    async getRestaurant(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { restaurantId } = restaurantIdSchema.parse(request.params);

        const result = await getRestaurantUseCase.execute({ restaurantId });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(200).send(result.value);
    }

    async listRestaurants(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const query = listRestaurantsSchema.parse(request.query);

        const result = await listRestaurantsUseCase.execute(query);

        return reply.status(200).send(result.value);
    }

    async toggleRestaurantStatus(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { restaurantId } = restaurantIdSchema.parse(request.params);
        const ownerId = request.user.sub;

        const result = await toggleRestaurantStatusUseCase.execute({ restaurantId, ownerId });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(200).send(result.value)
    }

    async updateRestaurantHours(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { restaurantId } = restaurantIdSchema.parse(request.params);
        const { businessHours } = updateRestaurantHoursSchema.parse(request.body);
        const ownerId = request.user.sub;

        const result = await updateRestaurantHoursUseCase.execute({
            restaurantId,
            ownerId,
            businessHours,
        });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(200).send(result.value);
    }

    async uploadRestaurantPhoto(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { restaurantId } = restaurantIdSchema.parse(request.params);
        const ownerId = request.user.sub;

        const file = await request.file();

        if(!file){
            return reply.status(400).send({ message: 'No files sent' });
        }

        const fileBuffer = await file.toBuffer();

        const result = await uploadRestaurantPhotoUseCase.execute({
            restaurantId,
            ownerId,
            fileName: file.filename,
            fileType: file.mimetype,
            fileBuffer
        });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(200).send(result.value);
    }

    async getTopRatedRestaurants(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { limit } = getTopRatedRestaurantsSchema.parse(request.query);

        const result = await getTopRatedRestaurantsUseCase.execute({ limit });

        return reply.status(200).send(result.value);
    }
}