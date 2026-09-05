import { getMerchantWalletUseCase } from "@/infrastructure/container/index.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import { handleError } from "../helpers/handle-error.js";

export class RestaurantOwnerWalletController {
    async getWallet(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const ownerId = request.user.sub;

        const result = await getMerchantWalletUseCase.execute(ownerId);

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(200).send(result.value)
    }
}