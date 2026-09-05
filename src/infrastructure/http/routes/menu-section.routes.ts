import type { FastifyInstance } from "fastify";
import { MenuSectionController } from "../controllers/menu-section.controller.js";
import { authenticateOwner } from "../middlewares/authenticate.js";

const controller = new MenuSectionController();

export async function menuSectionRoutes(app: FastifyInstance): Promise<void>{
    app.addHook('onRequest', authenticateOwner);

    app.post('/:restaurantId/sections', controller.createSection.bind(controller));
    app.put('/:restaurantId/sections/:sectionId', controller.updateSection.bind(controller));
    app.delete('/:restaurantId/sections/:sectionId', controller.deleteSection.bind(controller));
    app.patch('/:restaurantId/sections/reorder', controller.reorderSections.bind(controller));
}