import { describe, test, expect, beforeEach } from 'vitest';
import { Eliza } from './index';
import { Response } from './types';

describe('Eliza', () => {
    let eliza: Eliza;

    beforeEach(() => {
        eliza = new Eliza();
    });

    test('responds to hello', async () => {
        const response = await eliza.respond('hello');
        expect(response.text).toBeTruthy();
        expect(typeof response.text).toBe('string');
        expect(response.confidence).toBeGreaterThan(0);
        expect(response.memories).toHaveLength(1);
    });

    test('responds to "I am" statements', async () => {
        const response = await eliza.respond('I am happy');
        expect(response.text).toMatch(/happy/);
        expect(response.confidence).toBeGreaterThan(0.8);
        expect(response.memories).toHaveLength(1);
    });

    test('responds to "I feel" statements', async () => {
        const response = await eliza.respond('I feel sad');
        expect(response.text).toMatch(/sad/);
        expect(response.confidence).toBeGreaterThan(0.8);
        expect(response.memories).toHaveLength(1);
    });

    test('responds to emotional states', async () => {
        const response = await eliza.respond('I am feeling depressed');
        expect(response.text).toBeTruthy();
        expect(response.confidence).toBeGreaterThan(0.9);
        expect(response.memories).toHaveLength(1);
    });

    test('responds to why questions', async () => {
        const response = await eliza.respond('why is the sky blue?');
        expect(response.text).toBeTruthy();
        expect(response.confidence).toBeGreaterThan(0.6);
        expect(response.memories).toHaveLength(1);
    });

    test('responds to thank you', async () => {
        const response = await eliza.respond('thank you for your help');
        expect(response.text).toBeTruthy();
        expect(response.confidence).toBeGreaterThan(0.7);
        expect(response.memories).toHaveLength(1);
    });

    test('has default response for unmatched input', async () => {
        const response = await eliza.respond('xyzabc123');
        expect(response.text).toBeTruthy();
        expect(response.confidence).toBe(0.5);
        expect(response.memories).toHaveLength(1);
    });

    test('maintains short-term memory limit', async () => {
        for (let i = 0; i < 12; i++) {
            await eliza.respond(`message ${i}`);
        }
        expect(eliza.memories.filter(m => m.type === 'short_term')).toHaveLength(10);
    });

    test('can forget memories by type', async () => {
        await eliza.respond('hello');
        await eliza.respond('how are you');
        expect(eliza.memories).toHaveLength(2);

        eliza.forget('short_term');
        expect(eliza.memories).toHaveLength(0);
    });
});