// Testes da Pilha de pesquisas recentes.
// Rodar com: pnpm --filter @weunite/web test
import { test } from "node:test";
import assert from "node:assert/strict";
import { RecentSearchStack } from "../src/features/profile/state/recentSearchStack.ts";

type Perfil = { username: string };

const criarPilha = (capacidade = 10) =>
  new RecentSearchStack<Perfil>(capacidade, (perfil) => perfil.username);

const usernames = (pilha: RecentSearchStack<Perfil>) =>
  pilha.toArray().map((perfil) => perfil.username);

test("começa vazia", () => {
  const pilha = criarPilha();
  assert.equal(pilha.isEmpty(), true);
  assert.equal(pilha.size(), 0);
  assert.equal(pilha.peek(), undefined);
  assert.equal(pilha.pop(), undefined);
});

test("LIFO: o último empilhado fica no topo e sai primeiro", () => {
  const pilha = criarPilha();
  pilha.push({ username: "ana" });
  pilha.push({ username: "caio" });
  pilha.push({ username: "marca" });

  assert.deepEqual(usernames(pilha), ["marca", "caio", "ana"]);
  assert.equal(pilha.peek()?.username, "marca");
  assert.equal(pilha.pop()?.username, "marca");
  assert.equal(pilha.pop()?.username, "caio");
  assert.equal(pilha.size(), 1);
});

test("pesquisar de novo o mesmo perfil leva ele ao topo sem duplicar", () => {
  const pilha = criarPilha();
  pilha.push({ username: "ana" });
  pilha.push({ username: "caio" });
  pilha.push({ username: "ana" });

  assert.deepEqual(usernames(pilha), ["ana", "caio"]);
  assert.equal(pilha.size(), 2);
});

test("ao passar da capacidade descarta a pesquisa mais antiga (base)", () => {
  const pilha = criarPilha(3);
  ["a", "b", "c", "d"].forEach((username) => pilha.push({ username }));

  assert.deepEqual(usernames(pilha), ["d", "c", "b"]);
  assert.equal(pilha.size(), 3);
});

test("remove um item específico e limpa tudo", () => {
  const pilha = criarPilha();
  ["a", "b", "c"].forEach((username) => pilha.push({ username }));

  assert.equal(pilha.remove("b"), true);
  assert.equal(pilha.remove("nao-existe"), false);
  assert.deepEqual(usernames(pilha), ["c", "a"]);

  pilha.clear();
  assert.equal(pilha.isEmpty(), true);
});

test("fromTopFirst recria a mesma ordem salva no localStorage", () => {
  const salvo = [{ username: "c" }, { username: "b" }, { username: "a" }];
  const pilha = RecentSearchStack.fromTopFirst(salvo, 10, (p) => p.username);

  assert.deepEqual(usernames(pilha), ["c", "b", "a"]);
  assert.equal(pilha.peek()?.username, "c");
});

test("capacidade inválida gera erro", () => {
  assert.throws(() => criarPilha(0));
});
