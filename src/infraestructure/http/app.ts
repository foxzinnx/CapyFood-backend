import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import fastify from "fastify";
import { resolve } from "node:path";
import { restaurantOwnerRoutes } from "./routes/restaurant-owner.routes.js";
import { restaurantRoutes } from "./routes/restaurant.routes.js";
import { menuItemRoutes } from "./routes/menu-item.routes.js";
import { customerRoutes } from "./routes/customer.routes.js";
import { orderRoutes } from "./routes/order.routes.js";
import { reviewRoutes } from "./routes/review.routes.js";
import z, { ZodError } from "zod";
import { payflowWebhookRoutes } from "./routes/payflow-webhook.routes.js";
import { customerWalletRoutes } from "./routes/customer-wallet.routes.js";
import { restaurantOwnerWalletRoutes } from "./routes/restaurant-owner-wallet.routes.js";
import { menuSectionRoutes } from "./routes/menu-section.routes.js";

export async function buildApp(){
    const app = fastify({ logger: true });

    await app.register(fastifyCors, {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });

    await app.register(fastifyJwt, {
        secret: process.env.JWT_SECRET!
    });

    await app.register(fastifyMultipart, {
        limits: {
            fileSize: 5 * 1024 * 1024
        }
    });

    if(process.env.STORAGE_TYPE !== 'cloudinary'){
        await app.register(fastifyStatic, {
            root: resolve(process.env.UPLOAD_DIR ?? '/uploads'),
            prefix: '/uploads'
        });
    }

    await app.register(restaurantOwnerRoutes, { prefix: '/owners' });
    await app.register(restaurantRoutes, { prefix: '/restaurants' });
    await app.register(menuItemRoutes, { prefix: '/restaurants' });
    await app.register(customerRoutes, { prefix: '/customers' });
    await app.register(orderRoutes, { prefix: '/orders' });
    await app.register(reviewRoutes, { prefix: '/restaurants' });
    await app.register(payflowWebhookRoutes);
    await app.register(customerWalletRoutes, { prefix: '/customers' });
    await app.register(restaurantOwnerWalletRoutes, { prefix: '/owners' });
    await app.register(menuSectionRoutes, { prefix: '/restaurants' });

    app.setErrorHandler((error, _, reply) => {
        if(error instanceof ZodError){
            return reply.status(422).send({
                message: 'Validation error',
                errors: z.flattenError(error).fieldErrors
            })
        }

        const err = error as any;

        if(err.statusCode){
            return reply.status(err.statusCode).send({
                message: err.message
            })
        }

        app.log.error(error);
        return reply.status(500).send({
            message: 'Internal server error'
        })
    })

    return app;
}