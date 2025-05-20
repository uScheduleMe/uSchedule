declare module 'cartesian-product-generator' {
  export declare function product<T extends unknown[][]>(...arrays: T): IterableIterator<T[number]>;
}
