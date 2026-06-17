import { CPF } from "@/domain/value-objects/cpf.vo.js";
import { describe, expect, it } from "vitest";

describe('CPF', () => {
    describe('create', () => {
        it('should create a valid CPF without formatting', () => {
            const cpf = CPF.create('52998224725');

            expect(cpf.value).toBe('52998224725');
        });

        it('should create a valid CPF with formatting and strip it', () => {
            const cpf = CPF.create('529.982.247-25');

            expect(cpf.value).toBe('52998224725');
        });

        it('should throw when CPF has invalid check digits', () => {
            expect(() => CPF.create('52998224700')).toThrow('Invalid CPF');
        });

        it('should throw when CPF has less than 11 digits', () => {
            expect(() => CPF.create('5299822472')).toThrow('Invalid CPF');
        });

        it('should throw when CPF has all equal digits', () => {
            expect(() => CPF.create('11111111111')).toThrow('Invalid CPF');
        });

        it('should throw when CPF is empty', () => {
            expect(() => CPF.create('')).toThrow('Invalid CPF');
        })
    });

    describe('formatted', () => {
        it('should return CPF in formatted pattern XXX.XXX.XXX-XX', () => {
            const cpf = CPF.create('52998224725');

            expect(cpf.formatted).toBe('529.982.247-25');
        })
    });

    describe('equals', () => {
        it('should return true when two CPFs have the same value', () => {
            const cpf1 = CPF.create('70653131070');
            const cpf2= CPF.create('706.531.310-70');

            expect(cpf1.equals(cpf2)).toBe(true);
        });

        it('should return false when two CPFs have different values', () => {
            const cpf1 = CPF.create('70653131070');
            const cpf2 = CPF.create('41998374009');

            expect(cpf1.equals(cpf2)).toBe(false);
        })
    })
})