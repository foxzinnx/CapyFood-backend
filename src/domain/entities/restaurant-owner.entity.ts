import { NameTooShortError } from "../errors/name-too-short.error.js";
import { TooYoungError } from "../errors/too-young.error.js";
import type { CNPJ } from "../value-objects/cnpj.vo.js";
import type { Email } from "../value-objects/email.vo.js";
import { Name } from "../value-objects/name.vo.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";
import { Entity } from "./base.entity.js";

export interface RestaurantOwnerProps {
    name: Name;
    email: Email;
    password: string;
    cnpj: CNPJ;
    phone: string;
    birthDate: Date;
    payflowMerchantId: string | null;
    payflowWalletId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export class RestaurantOwner extends Entity<RestaurantOwnerProps>{
    private static readonly MIN_AGE = 18;
    
    private constructor(props: RestaurantOwnerProps, id?: UniqueEntityId){
        super(props, id);
    }

    static create(props: Omit<RestaurantOwnerProps, 'createdAt' | 'updatedAt' | 'name'> & { name: string }, id?: UniqueEntityId): RestaurantOwner {
        const name = Name.create(props.name)
        RestaurantOwner.validateAge(props.birthDate);
        
        return new RestaurantOwner(
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
    get cnpj(): CNPJ { return this._props.cnpj }
    get phone(): string { return this._props.phone }
    get birthDate(): Date { return this._props.birthDate }
    get payflowMerchantId(): string | null { return this._props.payflowMerchantId }
    get payflowWalletId(): string | null { return this._props.payflowWalletId }
    get createdAt(): Date { return this._props.createdAt }
    get updatedAt(): Date { return this._props.updatedAt }

    updateName(name: string): void {
        const nameVO = Name.create(name);
        this._props.name = nameVO;
        this.touch();
    }

    updateEmail(email: Email): void {
        this._props.email = email;
        this.touch();
    }

    updatePassword(hashedPassword: string): void {
        this._props.password = hashedPassword;
        this.touch();
    }

    updatePhone(phone: string): void {
        this._props.phone = phone;
        this.touch();
    }

    updateBirthDate(birthDate: Date): void {
        RestaurantOwner.validateAge(birthDate);
        this._props.birthDate = birthDate;
        this.touch();
    }

    linkToPayFlow(merchantId: string, walletId: string): void {
        this._props.payflowMerchantId = merchantId;
        this._props.payflowWalletId = walletId;
        this._props.updatedAt = new Date();
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

        if(realAge < RestaurantOwner.MIN_AGE){
            throw new TooYoungError(RestaurantOwner.MIN_AGE)
        }
    }

    private touch(): void {
        this._props.updatedAt = new Date();
    }
}