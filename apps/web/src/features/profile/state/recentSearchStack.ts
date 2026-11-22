/**
 * Pilha (LIFO — Last In, First Out) de pesquisas recentes.
 *
 * O último perfil aberto pela busca é empilhado no TOPO e por isso aparece
 * primeiro na lista de "Recentes". Internamente usamos um array em que:
 *   - índice 0          = BASE da pilha (pesquisa mais antiga)
 *   - último índice     = TOPO da pilha (pesquisa mais recente)
 *
 * Regras extras desta pilha:
 *   1. Sem duplicados: se o item já estiver na pilha, ele é retirado da posição
 *      antiga e empilhado de novo no topo (fica como o mais recente).
 *   2. Capacidade limitada: quando passa do limite, o item da BASE (o mais
 *      antigo) é descartado, para o histórico não crescer para sempre.
 */
export class RecentSearchStack<T> {
  private items: T[] = [];
  private readonly capacity: number;
  private readonly getKey: (item: T) => string;

  constructor(capacity: number, getKey: (item: T) => string) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new Error("A capacidade da pilha deve ser um inteiro maior que 0");
    }
    this.capacity = capacity;
    this.getKey = getKey;
  }

  /**
   * Recria a pilha a partir de uma lista já ordenada do topo para a base
   * (o mesmo formato devolvido por toArray e salvo no localStorage).
   */
  static fromTopFirst<T>(
    topFirst: T[],
    capacity: number,
    getKey: (item: T) => string,
  ): RecentSearchStack<T> {
    const stack = new RecentSearchStack<T>(capacity, getKey);
    // Empilha do mais antigo (fim da lista) para o mais recente (início),
    // assim o primeiro item da lista termina no topo.
    for (let i = topFirst.length - 1; i >= 0; i--) {
      stack.push(topFirst[i]);
    }
    return stack;
  }

  /** Empilha um item no topo. O(n) por causa da remoção de duplicado. */
  push(item: T): void {
    this.remove(this.getKey(item));
    this.items.push(item);

    if (this.items.length > this.capacity) {
      // Descarta a base (o mais antigo).
      this.items.shift();
    }
  }

  /** Desempilha e devolve o item do topo. O(1). */
  pop(): T | undefined {
    return this.items.pop();
  }

  /** Consulta o topo sem remover. O(1). */
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  /** Remove um item específico (usado pelo botão "X" de cada pesquisa). */
  remove(key: string): boolean {
    const index = this.items.findIndex((item) => this.getKey(item) === key);
    if (index === -1) {
      return false;
    }
    this.items.splice(index, 1);
    return true;
  }

  /** Esvazia a pilha (botão "Limpar tudo"). */
  clear(): void {
    this.items = [];
  }

  size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /** Cópia da pilha do TOPO para a BASE — a ordem em que a tela mostra. */
  toArray(): T[] {
    return [...this.items].reverse();
  }
}
