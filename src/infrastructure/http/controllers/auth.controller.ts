import type { FastifyReply, FastifyRequest } from "fastify";
import { logoutSchema, refreshSessionSchema } from "../schemas/auth.schema.js";
import { logoutUseCase, refreshSessionUseCase } from "@/infrastructure/container/index.js";
import { handleError } from "../helpers/handle-error.js";

export class AuthController {
    async refresh(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { refreshToken } = refreshSessionSchema.parse(request.body);

        const result = await refreshSessionUseCase.execute({ refreshToken });

        if(result.isLeft()){
            return handleError(result.value, reply)
        }

        return reply.status(200).send(result.value);
    }

    async logout(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { refreshToken } = logoutSchema.parse(request.body);

        await logoutUseCase.execute({ refreshToken });

        return reply.status(204).send();
    }
}