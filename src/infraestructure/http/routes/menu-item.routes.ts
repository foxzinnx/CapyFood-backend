import type { FastifyInstance } from "fastify";
import { MenuItemController } from "../controllers/menu-item.controller.js";
import { authenticateOwner } from "../middlewares/authenticate.js";

const menuItemController = new MenuItemController();

export async function menuItemRoutes(app: FastifyInstance){
    app.get('/menu-items/featured', menuItemController.getFeaturedMenuItems.bind(menuItemController));
    app.get('/:restaurantId/menu-items', menuItemController.listMenuItems.bind(menuItemController));

    app.post('/:restaurantId/menu-items', { preHandler: authenticateOwner }, menuItemController.createMenuItem.bind(menuItemController));
    app.post('/:restaurantId/menu-items/:menuItemId', { preHandler: authenticateOwner }, menuItemController.updateMenuItem.bind(menuItemController));
    app.delete('/:restaurantId/menu-items/:menuItemId', { preHandler: authenticateOwner }, menuItemController.deleteMenuItem.bind(menuItemController));
    app.patch('/:restaurantId/menu-items/:menuItemId/photo', { preHandler: authenticateOwner }, menuItemController.uploadMenuItemPhoto.bind(menuItemController));
}