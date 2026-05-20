import type { FastifyReply, FastifyRequest } from "fastify";

declare module '@fastify/jwt'{
    interface FastifyJWT {
        payload: { sub: string; role: string }
        user: { sub: string; role: string }
    }
}

const JWT_SECRET = process.env.JWT_SECRET!

if(!JWT_SECRET){
    throw new Error('JWT_SECRET not defined in environment variables');
}

export async function authenticateOwner(request: FastifyRequest, reply: FastifyReply){
    try {
        await request.jwtVerify();

        if(request.user.role !== 'OWNER'){
            return reply.status(403).send({ message: 'Access restricted to restaurant owners' })
        }
    } catch (error) {
        return reply.status(401).send({ message: 'Invalid or expired token' })
    }
}

export async function authenticateCustomer(request: FastifyRequest, reply: FastifyReply){
    await request.jwtVerify();

    try {
        if(request.user.role !== 'CUSTOMER'){
            return reply.status(403).send({ message: 'Access restricted to customers' })
        }
    } catch (error) {
        return reply.status(401).send({ message: 'Invalid or expired token' })
    }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply){
    try {
        await request.jwtVerify()
    } catch (error) {
        return reply.status(401).send({ message: 'Invalid or expired token' })
    }
}