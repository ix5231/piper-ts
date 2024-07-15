import { describe, test, expect } from "vitest";

import { Pipe, PipeAsync, PipeSync } from "./pipe";

describe("Pipe factory", () => {
  test("Select class by value", () => {
    expect(Pipe(1)).instanceOf(PipeSync);
    expect(Pipe(Promise.resolve(1))).instanceOf(PipeAsync);
  });
});

describe("and", () => {
  test("sync", () => {
    expect(
      Pipe(1)
        .and((n) => n + 1)
        .and((n) => n.toString()).value
    ).toEqual("2");
  });

  test("async", () => {
    expect(
      Pipe(Promise.resolve(1))
        .and(async (n) => n + 1)
        .and(async (n) => n.toString()).value
    ).resolves.toEqual("2");
  });

  test("merge to async", () => {
    const initial = Pipe(1);
    expect(initial).instanceOf(PipeSync);
    const turnToAsync = Pipe(1).and(async (n) => n + 1);
    expect(turnToAsync).instanceOf(PipeAsync);
  });
});
