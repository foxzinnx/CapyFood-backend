import type { FastifyInstance } from "fastify";
import { CustomerController } from "../controllers/customer.controller.js";
import { authenticateCustomer as authenticateCustomerMiddleware } from "../middlewares/authenticate.js";

const customerController = new CustomerController();

export async function customerRoutes(app: FastifyInstance){
    app.post('/register', customerController.registerCustomer.bind(customerController));
    app.post('/sessions', customerController.authenticateCustomer.bind(customerController));
    app.get('/me', { preHandler: authenticateCustomerMiddleware }, customerController.getCustomerProfile.bind(customerController));
}