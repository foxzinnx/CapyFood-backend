import { AuthenticateCustomerUseCase } from "@/application/use-cases/authenticate-customer/authenticate-customer.use-case.js";
import { Customer } from "@/domain/entities/customer.entity.js";
import { InvalidCredentialsError } from "@/domain/errors/invalid-credentials.error.js";
import { CPF } from "@/domain/value-objects/cpf.vo.js";
import { Email } from "@/domain/value-objects/email.vo.js";
import { FakeEncrypter } from "@/tests/fakes/fake-encrypter.js";
import { FakeHasher } from "@/tests/fakes/fake-hasher.js";
import { InMemoryCustomerRepository } from "@/tests/repositories/in-memory-customer.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

let customerRepository: InMemoryCustomerRepository;
let hasher: FakeHasher;
let encrypter: FakeEncrypter;
let sut: AuthenticateCustomerUseCase;

describe('AuthenticateCustomerUseCase', () => {
  beforeEach(async () => {
    customerRepository = new InMemoryCustomerRepository()
    hasher = new FakeHasher()
    encrypter = new FakeEncrypter()
    sut = new AuthenticateCustomerUseCase(customerRepository, hasher, encrypter)
 
    const customer = Customer.create({
      name: 'Bryan Gomes',
      email: Email.create('bryan@example.com'),
      password: await hasher.hash('123456'),
      cpf: CPF.create('52998224725'),
      phone: '11999999999',
      birthDate: new Date('1995-01-01'),
    })
 
    await customerRepository.create(customer)
  })
 
  it('should authenticate with valid credentials', async () => {
    const result = await sut.execute({
      email: 'bryan@example.com',
      password: '123456',
    })
 
    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.accessToken).toBeDefined()
    }
  })
 
  it('should generate a token with sub and CUSTOMER role', async () => {
    const result = await sut.execute({
      email: 'bryan@example.com',
      password: '123456',
    })
 
    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const payload = JSON.parse(result.value.accessToken)
      expect(payload.role).toBe('CUSTOMER')
      expect(payload.sub).toBe(customerRepository.items[0]?.id.value)
    }
  })
 
  it('should normalize email casing before lookup', async () => {
    const result = await sut.execute({
      email: 'BRYAN@EXAMPLE.COM',
      password: '123456',
    })
 
    expect(result.isRight()).toBe(true)
  })
 
  it('should not authenticate with a non-existent email', async () => {
    const result = await sut.execute({
      email: 'unknown@example.com',
      password: '123456',
    })
 
    expect(result.isLeft()).toBe(true)
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidCredentialsError)
    }
  })
 
  it('should not authenticate with a wrong password', async () => {
    const result = await sut.execute({
      email: 'bryan@example.com',
      password: 'wrong-password',
    })
 
    expect(result.isLeft()).toBe(true)
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidCredentialsError)
    }
  })
 
  it('should return the same error for unknown email and wrong password', async () => {
    const resultUnknownEmail = await sut.execute({
      email: 'unknown@example.com',
      password: '123456',
    })
    const resultWrongPassword = await sut.execute({
      email: 'bryan@example.com',
      password: 'wrong-password',
    })
 
    expect(resultUnknownEmail.isLeft() && resultWrongPassword.isLeft()).toBe(true)
    if (resultUnknownEmail.isLeft() && resultWrongPassword.isLeft()) {
      expect(resultUnknownEmail.value.message).toBe(resultWrongPassword.value.message)
    }
  })
})