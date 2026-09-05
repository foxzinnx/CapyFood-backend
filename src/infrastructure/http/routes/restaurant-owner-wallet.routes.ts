import type { FastifyInstance } from "fastify";
import { RestaurantOwnerWalletController } from "../controllers/restaurant-owner-wallet.controller.js";
import { authenticateOwner } from "../middlewares/authenticate.js";

const controller = new RestaurantOwnerWalletController();

export async function restaurantOwnerWalletRoutes(app: FastifyInstance): Promise<void>{
    app.get('/wallet', { preHandler: authenticateOwner }, controller.getWallet.bind(controller));
}