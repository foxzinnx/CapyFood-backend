import type { FastifyInstance } from "fastify";
import { RestaurantController } from "../controllers/restaurant.controller.js";
import { authenticateOwner } from "../middlewares/authenticate.js";

const restaurantController = new RestaurantController();

export async function restaurantRoutes(app: FastifyInstance){
    app.get('/', restaurantController.listRestaurants.bind(restaurantController));
    app.get('/top-rated', restaurantController.getTopRatedRestaurants.bind(restaurantController));
    app.get('/:restaurantId', restaurantController.getRestaurant.bind(restaurantController));

    app.post('/', {preHandler: authenticateOwner} ,restaurantController.createRestaurant.bind(restaurantController));
    app.patch('/:restaurantId/status', {preHandler: authenticateOwner} ,restaurantController.toggleRestaurantStatus.bind(restaurantController));
    app.put('/:restaurantId/hours', { preHandler: authenticateOwner }, restaurantController.updateRestaurantHours.bind(restaurantController));
    app.patch('/:restaurantId/photo', { preHandler: authenticateOwner }, restaurantController.uploadRestaurantPhoto.bind(restaurantController));
}