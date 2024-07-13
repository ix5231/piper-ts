class PipeOld<T> {
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
}

type PipeTry<T, E extends Error = never> = PipeOk<T, E> | PipeErr<T, E>;

class PipeOk<T, E extends Error = never> {
    #value: T;
    
    constructor(value: T) {
        this.#value = value;
    }
    
    get value() {
        return this.#value;
    }
    
    and<U>(fn: (arg: T) => U): PipeTry<U, E> {
        return new PipeOk(fn(this.#value));
    }
    
    try<
        F extends (arg: T) => any,
    >(fn: (arg: T) => any): PipeTry<
        Exclude<ReturnType<F>, Error>,
        E | Extract<ReturnType<F>, Error>
    > {
        const result = fn(this.#value);
        if (result instanceof Error) {
            return new PipeErr(result as Extract<ReturnType<F>, Error>);
        } else {
            return new PipeOk(result);
        }
    }
    
    catch(_handler: (arg: E) => unknown): PipeTry<T, E> {
        return new PipeOk(this.#value);
    }
}

class PipeErr<T, E extends Error = never> {
    #value: E;
    
    constructor(value: E) {
        this.#value = value;
    }
    
    get value() {
        return this.#value;
    }
    
    and<U>(fn: (arg: T) => U): PipeTry<U, E> {
        return new PipeErr(this.#value);
    }
    
    try<
        F extends (arg: T) => any,
    >(_fn: (arg: T) => any): PipeTry<
        Exclude<ReturnType<F>, Error>,
        E | Extract<ReturnType<F>, Error>
    > {
        return new PipeErr(this.#value);
    }
    
    catch<U>(handler: (arg: E) => U): PipeTry<U, E> {
        return new PipeOk(handler(this.#value));
    }
}
