import type { FastifyReply, FastifyRequest } from "fastify";
import { createOrderSchema, orderQuerySchema } from "../schemas/order.schema.js";
import { createOrderUseCase, listCustomerOrdersUseCase, listRestaurantOrdersUseCase } from "@/infraestructure/container/index.js";
import { handleError } from "../helpers/handle-error.js";
import { restaurantIdSchema } from "../schemas/restaurant.schema.js";

export class OrderController {
    async createOrder(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const body = createOrderSchema.parse(request.body);
        const customerId = request.user.sub;

        const result = await createOrderUseCase.execute({ customerId, ...body });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(201).send(result.value);
    }

    async listCustomerOrders(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const query = orderQuerySchema.parse(request.query);
        const customerId = request.user.sub;

        const result = await listCustomerOrdersUseCase.execute({ customerId, ...query });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(200).send(result.value);
    }

    async listRestaurantOrders(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { restaurantId } = restaurantIdSchema.parse(request.params);
        const ownerId = request.user.sub;
        const query = orderQuerySchema.parse(request.query);

        const result = await listRestaurantOrdersUseCase.execute({
            restaurantId,
            ownerId,
            ...query
        });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(200).send(result.value);
    }
}