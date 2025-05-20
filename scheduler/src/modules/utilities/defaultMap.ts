type GetDefault<K, V> = (key: K) => V;

export class DefaultMap<K, V> extends Map<K, V> {
  private readonly getDefault: GetDefault<K, V>;

  constructor(getDefault: GetDefault<K, V>) {
    super();
    this.getDefault = getDefault;
  }

  get(key: K): V {
    if (!this.has(key)) {
      this.set(key, this.getDefault(key));
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- We are setting the value above this line
    return super.get(key)!;
  }
}
