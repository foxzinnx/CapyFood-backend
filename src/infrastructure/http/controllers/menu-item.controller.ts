import type { FastifyReply, FastifyRequest } from "fastify";
import { restaurantIdSchema } from "../schemas/restaurant.schema.js";
import { createMenuItemSchema, getFeaturedMenuItemsSchema, menuItemIdSchema, updateMenuItemSchema } from "../schemas/menu-item.schema.js";
import { createMenuItemUseCase, deleteMenuItemUseCase, getFeaturedMenuItemsUseCase, listMenuItemsUseCase, storageService, updateMenuItemUseCase, uploadMenuItemPhotoUseCase } from "@/infrastructure/container/index.js";
import { handleError } from "../helpers/handle-error.js";
import type { MultipartFile } from "@fastify/multipart";

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export class MenuItemController {
    async createMenuItem(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { restaurantId } = restaurantIdSchema.parse(request.params);
        const ownerId = request.user.sub;

        const parts = request.parts();

        const fields: Record<string, string> = {};
        let imageFile: MultipartFile | undefined;

        for await (const part of parts){
            if(part.type === 'file'){
                imageFile = part;
            } else {
                fields[part.fieldname] = part.value as string
            }
        }
        
        const body = createMenuItemSchema.parse(fields);

        let imageUrl: string | undefined;

        if (imageFile) {
            if (!ALLOWED_MIME_TYPES.includes(imageFile.mimetype)) {
                return reply.status(400).send({
                    message: 'Invalid image format. Use JPEG, PNG, or WebP',
                })
            }

            const fileBuffer = await imageFile.toBuffer()

            imageUrl = await storageService.upload({
                fileName: imageFile.filename,
                fileType: imageFile.mimetype,
                fileBuffer,
                folder: 'menu-items',
            })
        }

        const result = await createMenuItemUseCase.execute({
            ownerId,
            restaurantId,
            ...body,
            imageUrl
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