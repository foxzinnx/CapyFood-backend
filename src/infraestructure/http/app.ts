import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import fastify from "fastify";
import { resolve } from "node:path";

export async function buildApp(){
    const app = fastify({ logger: true });

    await app.register(fastifyCors, {
        origin: '*'
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

    return app;
}