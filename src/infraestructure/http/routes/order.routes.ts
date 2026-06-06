import type { FastifyInstance } from "fastify";
import { OrderController } from "../controllers/order.controller.js";
import { authenticate, authenticateCustomer, authenticateOwner } from "../middlewares/authenticate.js";

const orderController = new OrderController();

export async function orderRoutes(app: FastifyInstance){
    app.post('/', { preHandler: authenticateCustomer }, orderController.createOrder.bind(orderController));
    app.get('/me', { preHandler: authenticateCustomer }, orderController.listCustomerOrders.bind(orderController));
    app.patch('/:orderId/cancel', { preHandler: authenticateCustomer }, orderController.cancelOrder.bind(orderController));

    app.get('/restaurant/:restaurantId', { preHandler: authenticateOwner }, orderController.listRestaurantOrders.bind(orderController));
    app.patch('/:orderId/status', { preHandler: authenticateOwner }, orderController.updateOrderStatus.bind(orderController));

    app.get('/:orderId', { preHandler: authenticate }, orderController.getOrder.bind(orderController));
}