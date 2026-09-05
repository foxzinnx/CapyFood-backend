import type { FastifyReply, FastifyRequest } from "fastify";
import { restaurantIdSchema } from "../schemas/restaurant.schema.js";
import { createMenuSectionSchema, reorderMenuSectionSchema, sectionIdSchema, updateMenuSectionSchema } from "../schemas/menu-section.schema.js";
import { createMenuSectionUseCase, deleteMenuSectionUseCase, reorderMenuSectionsUseCase, updateMenuSectionUseCase } from "@/infrastructure/container/index.js";
import { handleError } from "../helpers/handle-error.js";

export class MenuSectionController {
    async createSection(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { restaurantId } = restaurantIdSchema.parse(request.params);
        const body = createMenuSectionSchema.parse(request.body);
        const ownerId = request.user.sub;

        const result = await createMenuSectionUseCase.execute({
            restaurantId,
            ownerId,
            ...body
        });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(201).send(result.value);
    }

    async updateSection(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { sectionId } = sectionIdSchema.parse(request.params);
        const body = updateMenuSectionSchema.parse(request.body);
        const ownerId = request.user.sub;

        const result = await updateMenuSectionUseCase.execute({
            sectionId,
            ownerId,
            ...body
        });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(200).send(result.value);
    }

    async deleteSection(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { sectionId } = sectionIdSchema.parse(request.params);
        const ownerId = request.user.sub;

        const result = await deleteMenuSectionUseCase.execute({ sectionId, ownerId });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(204).send();
    }

    async reorderSections(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { restaurantId } = restaurantIdSchema.parse(request.params);
        const body = reorderMenuSectionSchema.parse(request.body);
        const ownerId = request.user.sub;

        const result = await reorderMenuSectionsUseCase.execute({
            restaurantId,
            ownerId,
            sections: body.sections
        });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(200).send(result.value);
    }
}