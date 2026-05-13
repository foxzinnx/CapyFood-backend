import type { FastifyReply, FastifyRequest } from "fastify";
import { authenticateOwnerSchema, registerOwnerSchema } from "../schemas/restaurant-owner.schema.js";
import { authenticateRestaurantOwnerUseCase, createRestaurantOwnerUseCase } from "@/infraestructure/container/index.js";
import { handleError } from "../helpers/handle-error.js";

export class RestaurantOwnerController {
    async registerOwner(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const body = registerOwnerSchema.parse(request.body);

        const result = await createRestaurantOwnerUseCase.execute(body);

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(201).send(result.value);
    }

    async authenticateOwner(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const body = authenticateOwnerSchema.parse(request.body);

        const result = await authenticateRestaurantOwnerUseCase.execute(body);

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(200).send(result.value);
    }
}