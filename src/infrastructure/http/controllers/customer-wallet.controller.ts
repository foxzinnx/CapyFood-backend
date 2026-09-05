import { depositToWalletUseCase, getCustomerWalletUseCase } from "@/infrastructure/container/index.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import { handleError } from "../helpers/handle-error.js";
import { depositToWalletSchema } from "../schemas/wallet.schema.js";

export class CustomerWalletController {
    async getWallet(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const customerId = request.user.sub;

        const result = await getCustomerWalletUseCase.execute({ customerId });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(200).send(result.value);
    }

    async deposit(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const customerId = request.user.sub;
        const body = depositToWalletSchema.parse(request.body);

        const result = await depositToWalletUseCase.execute(customerId, body);

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(201).send(result.value);
    }
}