export class RecentSearchStack<T> {
  private items: T[] = [];
  private readonly limit: number;

  constructor(initialItems: T[] = [], limit = 10) {
    this.limit = limit;
    for (const item of initialItems) {
      this.push(item);
    }
  }

  push(item: T): void {
    if (this.items.length > 0) {
      this.items = this.items.filter((current) => !Object.is(current, item));
    }

    this.items.push(item);

    if (this.items.length > this.limit) {
      this.items.shift();
    }
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  remove(item: T): void {
    this.items = this.items.filter((current) => !Object.is(current, item));
  }

  clear(): void {
    this.items = [];
  }

  get size(): number {
    return this.items.length;
  }

  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  toArray(): T[] {
    return [...this.items].reverse();
  }

  static fromTopFirst<T>(items: T[], limit = 10): RecentSearchStack<T> {
    const stack = new RecentSearchStack<T>([], limit);
    for (const item of [...items].reverse()) {
      stack.push(item);
    }
    return stack;
  }
}
