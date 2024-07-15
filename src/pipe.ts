type NoDistribute<T> = [T] extends [T] ? T : never;
type Pipe<T> =
  NoDistribute<T> extends Promise<any> ? PipeAsync<Awaited<T>> : PipeSync<T>;

export function Pipe<T>(initialValue: T): Pipe<T> {
  if (initialValue instanceof Promise) {
    return new PipeAsync(initialValue) as Pipe<T>;
  }
  return new PipeSync(initialValue) as Pipe<T>;
}

export class PipeSync<T> {
  #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  get value() {
    return this.#value;
  }

  and<U>(fn: (arg: T) => U): Pipe<U> {
    return Pipe(fn(this.#value));
  }

  andOk<F extends (arg: Exclude<T, Error>) => any>(
    fn: F
  ): Pipe<ReturnType<F> | Extract<T, Error>> {
    if (this.#value instanceof Error) {
      return Pipe(this.#value as Extract<T, Error>);
    } else {
      return Pipe<ReturnType<F>>(fn(this.#value as Exclude<T, Error>));
    }
  }

  coalesceError<F extends (arg: Extract<T, Error>) => any>(
    fn: F
  ): Pipe<ReturnType<F>> {
    if (this.#value instanceof Error) {
      return Pipe<ReturnType<F>>(fn(this.#value as Extract<T, Error>));
    } else {
      return Pipe(this.#value as Exclude<ReturnType<F>, Error>);
    }
  }

  andMaybe<F extends (arg: Exclude<T, undefined | null>) => any>(
    fn: F
  ): Pipe<ReturnType<F> | Extract<T, null | undefined>> {
    if (this.#value == null) {
      return Pipe(this.#value as Extract<T, null | undefined>);
    } else {
      return Pipe<ReturnType<F>>(
        fn(this.#value as Exclude<T, undefined | null>)
      );
    }
  }

  coalesceNullish<F extends (arg: Extract<T, undefined | null>) => any>(
    fn: F
  ): Pipe<ReturnType<F>> {
    if (this.#value == null) {
      return Pipe<ReturnType<F>>(
        fn(this.#value as Extract<T, undefined | null>)
      );
    } else {
      return Pipe(this.#value as Exclude<ReturnType<F>, undefined | null>);
    }
  }
}

export class PipeAsync<T> {
  #value: Promise<T>;

  constructor(value: Promise<T>) {
    this.#value = value;
  }

  get value() {
    return this.#value;
  }

  and<U>(fn: (arg: T) => U): PipeAsync<Awaited<U>> {
    return Pipe(this.#value.then(fn));
  }

  andOk<F extends (arg: Exclude<T, Error>) => any>(
    fn: F
  ): PipeAsync<Awaited<ReturnType<F>> | Extract<T, Error>> {
    return Pipe(
      this.#value.then((v) => {
        if (v instanceof Error) {
          return v as Extract<T, Error>;
        } else {
          return fn(v as Exclude<T, Error>);
        }
      })
    );
  }

  coalesceError<F extends (arg: Extract<T, Error>) => any>(
    fn: F
  ): PipeAsync<Exclude<ReturnType<F>, Error>> {
    return Pipe(
      this.#value.then((v) => {
        if (v instanceof Error) {
          return fn(v as Extract<T, Error>);
        } else {
          return v as Exclude<ReturnType<F>, Error>;
        }
      })
    );
  }

  andMaybe<F extends (arg: Exclude<T, undefined | null>) => any>(
    fn: F
  ): PipeAsync<ReturnType<F> | Extract<T, null | undefined>> {
    return Pipe(
      this.#value.then((v) => {
        if (v == null) {
          return v as Extract<T, null | undefined>;
        } else {
          return fn(v as Exclude<T, undefined | null>);
        }
      })
    );
  }

  coalesceNullish<F extends (arg: Extract<T, undefined | null>) => any>(
    fn: F
  ): PipeAsync<Exclude<ReturnType<F>, undefined | null>> {
    return Pipe(
      this.#value.then((v) => {
        if (v == null) {
          return fn(v as Extract<T, undefined | null>);
        } else {
          return v as Exclude<ReturnType<F>, undefined | null>;
        }
      })
    );
  }
}

const a = Pipe(1).and(async () => 1).value;
