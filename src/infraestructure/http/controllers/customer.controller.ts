import type { FastifyReply, FastifyRequest } from "fastify";
import { authenticateCustomerSchema, registerCustomerSchema } from "../schemas/customer.schema.js";
import { authenticateCustomerUseCase, createCustomerUseCase, getCustomerProfileUseCase } from "@/infraestructure/container/index.js";
import { handleError } from "../helpers/handle-error.js";

export class CustomerController {
    async registerCustomer(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const body = registerCustomerSchema.parse(request.body);

        const result = await createCustomerUseCase.execute(body);

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(201).send(result.value);
    }

    async authenticateCustomer(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const body = authenticateCustomerSchema.parse(request.body);

        const result = await authenticateCustomerUseCase.execute(body);

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(200).send(result.value);
    }

    async getCustomerProfile(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const customerId = request.user.sub;

        const result = await getCustomerProfileUseCase.execute({ customerId });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(200).send(result.value);
    }
}