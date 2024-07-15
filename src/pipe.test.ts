import { describe, test, expect, expectTypeOf } from "vitest";

import { Pipe, PipeAsync, PipeSync } from "./pipe";

describe("Pipe factory", () => {
  test("Select class by value", () => {
    expect(Pipe(1)).instanceOf(PipeSync);
    expect(Pipe(Promise.resolve(1))).instanceOf(PipeAsync);
  });
});

describe("and", () => {
  describe("sync", () => {
    test("simple", () => {
      expect(
        Pipe(1)
          .and((n) => n + 1)
          .and((n) => n.toString()).value
      ).toEqual("2");
    });

    test("check type convertion works", () => {
      const p = Pipe(1)
        .and((n) => n + 1)
        .and((n) => n.toString());
      expectTypeOf(p.and).parameter(0).parameter(0).toMatchTypeOf<string>();
      expectTypeOf(p.value).toMatchTypeOf<string>();
    });
  });

  describe("async", () => {
    test("unwrap promise for an argument of the callback", () => {
      const p = Pipe(Promise.resolve(1)).and((n) => n + 1);
      expectTypeOf(p.and).parameter(0).parameter(0).toMatchTypeOf<number>();
      expectTypeOf(p.value).toMatchTypeOf<Promise<number>>();
    });

    test("flattens promises", () => {
      const p = Pipe(Promise.resolve(1))
        .and(async (n) => n + 1)
        .and(async (n) => n.toString());
      expectTypeOf(p.and).parameter(0).parameter(0).toMatchTypeOf<string>();
      expectTypeOf(p.value).toMatchTypeOf<Promise<string>>();
    });

    test("check type convertion works", () => {
      const p = Pipe(Promise.resolve(1))
        .and((n) => n + 1)
        .and((n) => n.toString());
      expectTypeOf(p.and).parameter(0).parameter(0).toMatchTypeOf<string>();
      expectTypeOf(p.value).toMatchTypeOf<Promise<string>>();
    });
  });

  test("can be turned to async", () => {
    const initial = Pipe(1);
    expect(initial).instanceOf(PipeSync);
    const turnToAsync = initial.and(async (n) => n + 1);
    expect(turnToAsync).instanceOf(PipeAsync);
  });
});

describe("andOk", () => {
  class E1 extends Error {}
  class E2 extends Error {}

  describe("sync", () => {
    test("doesn't skip non error value", () => {
      expect(
        Pipe(1)
          .andOk((n) => (n % 2 === 0 ? new Error() : n))
          .andOk((n) => (n % 2 === 0 ? new Error() : n)).value
      ).toEqual(1);
    });

    test("skips error value but yet preserve error type", () => {
      const e1 = new E1();
      const e2 = new E2();
      const p = Pipe(1)
        .andOk((n) => (n % 2 === 1 ? e1 : n))
        .andOk((n) => (n % 2 === 1 ? e2 : n));
      expect(p.value).toEqual(e1);
      expectTypeOf(p.value).toMatchTypeOf<number | E1 | E2>();
    });

    test("check type convertion works", () => {
      const p = Pipe(1)
        .andOk((n) => (n % 2 === 0 ? new Error() : n))
        .andOk((n) => (n % 2 === 0 ? new Error() : n.toString()));
      expect(p.value).toEqual("1");
      expectTypeOf(p.value).toMatchTypeOf<string | Error>();
    });
  });

  describe("async", () => {
    test("doesn't skip non error value", () => {
      expect(
        Pipe(Promise.resolve(1))
          .andOk((n) => (n % 2 === 0 ? new Error() : n))
          .andOk((n) => (n % 2 === 0 ? new Error() : n)).value
      ).resolves.toEqual(1);
    });

    test("flattens promises and unwrap an argument of the callback from promise", () => {
      const p = Pipe(Promise.resolve(1))
        .andOk(async (n) => (n % 2 === 0 ? new Error() : n))
        .andOk(async (n) => (n % 2 === 0 ? new Error() : n));
      expectTypeOf(p.value).toMatchTypeOf<Promise<number | Error>>();
      expectTypeOf(p.andOk)
        .parameter(0)
        .parameter(0)
        .toMatchTypeOf<number | Error>();
    });

    test("skips error value but yet preserve error type", () => {
      const e1 = new E1();
      const e2 = new E2();
      const p = Pipe(Promise.resolve(1))
        .andOk((n) => (n % 2 === 1 ? e1 : n))
        .andOk((n) => (n % 2 === 1 ? e2 : n));
      expect(p.value).resolves.toEqual(e1);
      expectTypeOf(p.value).toMatchTypeOf<Promise<number | E1 | E2>>();
    });

    test("check type convertion works", () => {
      const p = Pipe(Promise.resolve(1))
        .andOk((n) => (n % 2 === 0 ? new Error() : n))
        .andOk((n) => (n % 2 === 0 ? new Error() : n.toString()));
      expect(p.value).resolves.toEqual("1");
      expectTypeOf(p.value).toMatchTypeOf<Promise<string | Error>>();
    });
  });

  test("can be turned to async", () => {
    const initial = Pipe(1);
    expect(initial).instanceOf(PipeSync);
    const turnToAsync = initial.andOk(async (n) =>
      n % 1 === 0 ? n : new Error()
    );
    expect(turnToAsync).instanceOf(PipeAsync);
  });
});
