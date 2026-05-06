import { TooYoungError } from "../errors/too-young.error.js";
import type { CPF } from "../value-objects/cpf.vo.js";
import type { Email } from "../value-objects/email.vo.js";
import { Name } from "../value-objects/name.vo.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";
import { Entity } from "./base.entity.js";

export interface CustomerProps {
    name: Name;
    email: Email;
    password: string;
    cpf: CPF;
    phone: string;
    birthDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CustomerOutputDTO{
    id: string;
    name: string;
    email: string;
    cpf: string;
    phone: string;
    birthDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

export class Customer extends Entity<CustomerProps>{
    private static readonly MIN_AGE = 18;
    
    private constructor(props: CustomerProps, id?: UniqueEntityId){
        super(props, id);
    }

    static create(props: Omit<CustomerProps, 'createdAt' | 'updatedAt' | 'name'> & { name: string }, id?: UniqueEntityId): Customer {
        const name = Name.create(props.name);
        Customer.validateAge(props.birthDate)
        
        return new Customer(
            {
                ...props,
                name,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            id
        )
    }

    get name(): Name { return this._props.name }
    get email(): Email { return this._props.email }
    get password(): string { return this._props.password }
    get cpf(): CPF { return this._props.cpf }
    get phone(): string { return this._props.phone }
    get birthDate(): Date { return this._props.birthDate }
    get createdAt(): Date { return this._props.createdAt }
    get updatedAt(): Date { return this._props.updatedAt }

    updateName(name: string): void {
        this._props.name = Name.create(name);
        this.touch()
    }

    updateEmail(email: Email): void {
        this._props.email = email;
        this.touch();
    }

    updatePassword(password: string): void {
        this._props.password = password;
        this.touch();
    }

    updatePhone(phone: string): void {
        this._props.phone = phone;
        this.touch();
    }

    updateBirthDate(birthDate: Date): void {
        Customer.validateAge(birthDate);
        this._props.birthDate = birthDate;
        this.touch();
    }

    private static validateAge(birthDate: Date): void {
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();

        const birthdayThisYear = new Date(
            today.getFullYear(),
            birthDate.getMonth(),
            birthDate.getDate()
        )
        const hasHadBirthdayThisYear = today >= birthdayThisYear

        const realAge = hasHadBirthdayThisYear ? age : age - 1

        if(realAge < Customer.MIN_AGE){
            throw new TooYoungError(Customer.MIN_AGE)
        }
    }

    toOutputDTO(): CustomerOutputDTO {
        return {
            id: this.id.value,
            name: this._props.name.value,
            email: this._props.email.value,
            cpf: this._props.cpf.value,
            phone: this._props.phone,
            birthDate: this._props.birthDate,
            createdAt: this._props.createdAt,
            updatedAt: this._props.updatedAt
        }
    }

    private touch(): void {
        this._props.updatedAt = new Date();
    }
}