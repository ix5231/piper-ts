import { describe, test, expect } from 'vitest';

import { Pipe, PipeAsync, PipeSync } from './pipe';

describe('Pipe factory', () => {
    test('Select class by value', () => {
        expect(Pipe(1)).instanceOf(PipeSync);
        expect(Pipe(Promise.resolve(1))).instanceOf(PipeAsync);
    })
});

// describe.todo('PipeSync');

// describe.todo('PipeAsync');