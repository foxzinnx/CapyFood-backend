import type { FastifyReply, FastifyRequest } from "fastify";
import { restaurantIdSchema } from "../schemas/restaurant.schema.js";
import { createMenuItemSchema, getFeaturedMenuItemsSchema, menuItemIdSchema, updateMenuItemSchema } from "../schemas/menu-item.schema.js";
import { createMenuItemUseCase, deleteMenuItemUseCase, getFeaturedMenuItemsUseCase, listMenuItemsUseCase, updateMenuItemUseCase, uploadMenuItemPhotoUseCase } from "@/infraestructure/container/index.js";
import { handleError } from "../helpers/handle-error.js";

export class MenuItemController {
    async createMenuItem(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { restaurantId } = restaurantIdSchema.parse(request.params);
        const body = createMenuItemSchema.parse(request.body);
        const ownerId = request.user.sub;

        const result = await createMenuItemUseCase.execute({
            ownerId,
            restaurantId,
            ...body,
        });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(201).send(result.value);
    }

    async updateMenuItem(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { menuItemId } = menuItemIdSchema.parse(request.params);
        const body = updateMenuItemSchema.parse(request.body);
        const ownerId = request.user.sub;

        const result = await updateMenuItemUseCase.execute({
            ownerId,
            menuItemId,
            ...body
        });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(200).send(result.value);
    }

    async deleteMenuItem(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { menuItemId } = menuItemIdSchema.parse(request.params);
        const ownerId = request.user.sub;

        const result = await deleteMenuItemUseCase.execute({ ownerId, menuItemId });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(204).send()
    }

    async listMenuItems(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { restaurantId } = restaurantIdSchema.parse(request.params);

        const result = await listMenuItemsUseCase.execute({ restaurantId });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(200).send(result.value)
    }

    async uploadMenuItemPhoto(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { menuItemId } = menuItemIdSchema.parse(request.params);
        const ownerId = request.user.sub;

        const file = await request.file();

        if(!file){
            return reply.status(400).send({ message: 'No files sent' });
        }

        const fileBuffer = await file.toBuffer();

        const result = await uploadMenuItemPhotoUseCase.execute({
            menuItemId,
            ownerId,
            fileName: file.filename,
            fileType: file.mimetype,
            fileBuffer
        });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(200).send(result.value)
    }

    async getFeaturedMenuItems(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { limit } = getFeaturedMenuItemsSchema.parse(request.query);

        const result = await getFeaturedMenuItemsUseCase.execute({ limit });

        if(result.isLeft()){
            return handleError(result.value, reply);
        }

        return reply.status(200).send(result.value);
    }
}