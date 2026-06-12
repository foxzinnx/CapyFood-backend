import type { Customer } from "@/domain/entities/customer.entity.js";
import type { CustomerRepository } from "@/domain/repositories/customer.repository.js";

export class InMemoryCustomerRepository implements CustomerRepository {
    public items: Customer[] = [];


    async create(customer: Customer): Promise<void> {
        this.items.push(customer);
    }

    async findById(id: string): Promise<Customer | null> {
        return this.items.find((c) => c.id.value === id) ?? null;
    }

    async findByEmail(email: string): Promise<Customer | null> {
        return this.items.find((c) => c.email.value === email) ?? null;
    }

    async findByCpf(cpf: string): Promise<Customer | null> {
        return this.items.find((c) => c.cpf.value === cpf) ?? null;
    }

    async save(customer: Customer): Promise<void> {
        const index = this.items.findIndex((c) => c.id.value === customer.id.value);
        if(index > 0) this.items[index] = customer;
    }

}