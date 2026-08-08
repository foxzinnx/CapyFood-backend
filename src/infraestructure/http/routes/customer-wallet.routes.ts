import type { FastifyInstance } from "fastify";
import { CustomerWalletController } from "../controllers/customer-wallet.controller.js";
import { authenticateCustomer } from "../middlewares/authenticate.js";

const controller = new CustomerWalletController();

export async function customerWalletRoutes(app: FastifyInstance): Promise<void>{
    app.addHook('onRequest', authenticateCustomer);

    app.get('/wallet', controller.getWallet.bind(controller));
    app.post('/wallet/deposit', controller.deposit.bind(controller));
}