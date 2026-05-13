import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from 'jsonwebtoken';

interface JwtPayload {
    sub: string;
    role: string;
}

declare module 'fastify'{
    interface FastifyRequest {
        user: JwtPayload
    }
}

const JWT_SECRET = process.env.JWT_SECRET!

if(!JWT_SECRET){
    throw new Error('JWT_SECRET not defined in environment variables');
}

export async function authenticateOwner(request: FastifyRequest, reply: FastifyReply){
    const authHeader = request.headers.authorization;

    if(!authHeader){
        return reply.status(401).send({ message: 'Token not provided' });
    }

    const token = authHeader.split(' ')[1];

    if(!token){
        return reply.status(401).send({ message: 'Token not provided' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

        if(payload.role !== 'OWNER'){
            return reply.status(403).send({ message: 'Access restricted to restaurant owners' })
        }

        request.user = payload;
    } catch (error) {
        return reply.status(401).send({ message: 'Invalid or expired token' })
    }
}

export async function authenticateCustomer(request: FastifyRequest, reply: FastifyReply){
    const authHeader = request.headers.authorization;

    if(!authHeader){
        return reply.status(401).send({ message: 'Token not provided' });
    }

    const token = authHeader.split(' ')[1];

    if(!token){
        return reply.status(401).send({ message: 'Token not provided' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

        if(payload.role !== 'CUSTOMER'){
            return reply.status(403).send({ message: 'Access restricted to customers' })
        }

        request.user = payload;
    } catch (error) {
        return reply.status(401).send({ message: 'Invalid or expired token' })
    }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply){
    const authHeader = request.headers.authorization;

    if(!authHeader){
        return reply.status(401).send({ message: 'Token not provided' });
    }

    const token = authHeader.split(' ')[1];

    if(!token){
        return reply.status(401).send({ message: 'Token not provided' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
        request.user = payload;
    } catch (error) {
        return reply.status(401).send({ message: 'Invalid or expired token' })
    }
}