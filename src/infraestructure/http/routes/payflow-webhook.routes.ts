import type { FastifyInstance } from "fastify";
import crypto from 'crypto'
import { env } from "@/shared/env/index.js";
import { orderRepository } from "@/infraestructure/container/index.js";

interface WebhookBody{
    event: 'transaction.approved' | 'transaction.failed' | 'transaction.refunded'
    data: {
        id: string;
        status: string;
        denialReason: string | null;
        metadata: {
            orderId?: string;
            source?: string;
        } | null;
    }
}

export async function payflowWebhookRoutes(app: FastifyInstance): Promise<void>{
    app.post('/webhooks/payflow', async (request, reply) => {
        const signature = request.headers['x-payflow-signature'];
        const body = JSON.stringify(request.body);

        const expected = crypto
            .createHmac('sha256', env.PAYFLOW_WEBHOOK_SECRET)
            .update(body)
            .digest('hex')

        if(signature !== expected){
            return reply.status(401).send({ message: 'Invalid signature' });
        }

        const { event, data } = request.body as WebhookBody;

        if(data.metadata?.source !== 'capyfood'){
            return reply.status(200).send('ok');
        }

        const orderId = data.metadata.orderId;
        if(!orderId){
            return reply.status(200).send('ok');
        }

        const order = await orderRepository.findById(orderId);
        if(!order){
            return reply.status(200).send('ok');
        }

        switch(event){
            case "transaction.approved":
                if(!order.isPaid){
                    order.linkTransaction(data.id);
                    await orderRepository.save(order);
                }
                break;

            case "transaction.failed":
                order.markPaymentFailed();
                await orderRepository.save(order);
                break

            case "transaction.refunded":
                order.markPaymentRefunded();
                await orderRepository.save(order);
                break
        }

        return reply.status(200).send('ok');
    })
}