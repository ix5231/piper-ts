type PromiseFlat<T> =
    T extends Promise<Promise<infer U>> ? PromiseFlat<Promise<U>> :
    T extends Promise<unknown> ? T : Promise<T>;

export class Pipe<T> {
    #value: T;
    
    constructor(value: T) {
        this.#value = value;
    }
    
    get value() {
        return this.#value;
    }
    
    and<U>(fn: (arg: T) => U): Pipe<U> {
        return new Pipe(fn(this.#value));
    }
    
    andTry<
        F extends (arg: Exclude<T, Error>) => any,
    >(fn: F): Pipe<ReturnType<F> | Extract<T, Error>> {
        if (this.#value instanceof Error) {
            return new Pipe(this.#value as Extract<T, Error>);
        } else {
            return new Pipe(fn(this.#value as Exclude<T, Error>));
        }
    }
    
    coalesceError<
        F extends (arg: Extract<T, Error>) => any,
    >(fn: F): Pipe<Exclude<ReturnType<F>, Error>> {
        if (this.#value instanceof Error) {
            return new Pipe(fn(this.#value as Extract<T, Error>));
        } else {
            return new Pipe(this.#value as Exclude<ReturnType<F>, Error>);
        }
    }
    
    andMaybe<
        F extends (arg: Exclude<T, undefined | null>) => any,
    >(fn: F): Pipe<ReturnType<F> | Extract<T, null | undefined>> {
        if (this.#value == null) {
            return new Pipe(this.#value as Extract<T, null | undefined>);
        } else {
            return new Pipe(fn(this.#value as Exclude<T, undefined | null>));
        }
    }
    
    coalesceNullish<
        F extends (arg: Extract<T, undefined | null>) => any,
    >(fn: F): Pipe<Exclude<ReturnType<F>, undefined | null>> {
        if (this.#value == null) {
            return new Pipe(fn(this.#value as Extract<T, undefined | null>));
        } else {
            return new Pipe(this.#value as Exclude<ReturnType<F>, undefined | null>);
        }
    }
}