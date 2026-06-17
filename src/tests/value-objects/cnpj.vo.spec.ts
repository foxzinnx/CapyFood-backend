import { CNPJ } from '@/domain/value-objects/cnpj.vo.js'
import { describe, expect, it } from 'vitest'

describe('CNPJ', () => {
    describe('create', () => {
        it('should create a valid CNPJ without formatting', () => {
            const cnpj = CNPJ.create('52695699000155');

            expect(cnpj.value).toBe('52695699000155')
        });

        it('should create a valid CNPJ with formatting and strip it', () => {
            const cnpj = CNPJ.create('71.072.614/0001-27');

            expect(cnpj.value).toBe('71072614000127')
        });

        it('should throw when CNPJ has invalid check digits', () => {
            expect(() => CNPJ.create('11222333000011')).toThrow('Invalid CNPJ')
        });

        it('should throw when CNPJ has less than 14 digits', () => {
            expect(() => CNPJ.create('1122233300018')).toThrow('Invalid CNPJ')
        });

        it('should throw when CNPJ has all equal digits', () => {
            expect(() => CNPJ.create('11111111111111')).toThrow('Invalid CNPJ');
        });

        it('should throw when CNPJ is empty', () => {
            expect(() => CNPJ.create('')).toThrow('Invalid CNPJ')
        });
    });

    describe('formatted', () => {
        it('should return CNPJ in formatted pattern XX.XXX.XXX/XXXX-XX', () => {
            const cnpj = CNPJ.create('11222333000181');

            expect(cnpj.formatted).toBe('11.222.333/0001-81');
        })
    })

    describe('equals', () => {
        it('should return true when two CNPJs have the same value', () => {
            const cnpj1 = CNPJ.create('11222333000181');
            const cnpj2 = CNPJ.create('11.222.333/0001-81');

            expect(cnpj1.equals(cnpj2)).toBe(true);
        });

        it('should return false when two CNPJs have different values', () => {
            const cnpj1 = CNPJ.create('11222333000181');
            const cnpj2 = CNPJ.create('40901221000155');

            expect(cnpj1.equals(cnpj2)).toBe(false);
        })
    })
})