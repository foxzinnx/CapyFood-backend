import type { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller.js";

const authController = new AuthController();

export async function authRoutes(app: FastifyInstance): Promise<void>{
    app.post('/refresh', authController.refresh.bind(authController));
    app.post('/logout', authController.logout.bind(authController));
}