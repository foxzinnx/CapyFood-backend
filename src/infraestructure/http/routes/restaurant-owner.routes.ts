import type { FastifyInstance } from "fastify";
import { RestaurantOwnerController } from "../controllers/restaurant-owner.controller.js";

const restaurantOwnerController = new RestaurantOwnerController();

export async function restaurantOwnerRoutes(app: FastifyInstance){
    app.post('/register', restaurantOwnerController.registerOwner.bind(restaurantOwnerController));
    app.post('/sessions', restaurantOwnerController.authenticateOwner.bind(restaurantOwnerController));
}