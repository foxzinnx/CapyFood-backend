import type { Customer } from "@/domain/entities/customer.entity.js";
import type { CustomerRepository } from "@/domain/repositories/customer.repository.js";
import { CustomerMapper } from "../mappers/customer.mapper.js";
import { prisma } from "../prisma.js";

export class PrismaCustomerRepository implements CustomerRepository {
    async create(customer: Customer): Promise<void> {
        const data = CustomerMapper.toPrisma(customer);

        await prisma.customer.create({ data });
    }

    async findById(id: string): Promise<Customer | null> {
        const raw = await prisma.customer.findUnique({
            where: { id }
        });

        if(!raw) return null;

        return CustomerMapper.toDomain(raw);
    }

    async findByEmail(email: string): Promise<Customer | null> {
        const raw = await prisma.customer.findUnique({
            where: { email }
        });

        if(!raw) return null;

        return CustomerMapper.toDomain(raw);
    }

    async findByCpf(cpf: string): Promise<Customer | null> {
        const raw = await prisma.customer.findUnique({
            where: { cpf }
        });

        if(!raw) return null;

        return CustomerMapper.toDomain(raw);
    }

    async save(customer: Customer): Promise<void> {
        const data = CustomerMapper.toPrisma(customer);

        await prisma.customer.update({
            where: { id: data.id },
            data
        });
    }

}