import test from "node:test";
import assert from "node:assert/strict";
import { RecentSearchStack } from "../src/features/profile/state/recentSearchStack.ts";

test("push and peek follow top-first behavior", () => {
  const stack = new RecentSearchStack<string>();
  stack.push("Ana");
  stack.push("Bruno");
  assert.equal(stack.peek(), "Bruno");
  assert.deepEqual(stack.toArray(), ["Bruno", "Ana"]);
});

test("pop removes only the top item", () => {
  const stack = new RecentSearchStack<string>(["Ana", "Bruno"]);
  assert.equal(stack.pop(), "Bruno");
  assert.deepEqual(stack.toArray(), ["Ana"]);
});

test("push moves duplicate to top", () => {
  const stack = new RecentSearchStack<string>(["Ana", "Bruno", "Carla"]);
  stack.push("Bruno");
  assert.deepEqual(stack.toArray(), ["Bruno", "Carla", "Ana"]);
});

test("limit keeps only the ten most recent items", () => {
  const stack = new RecentSearchStack<number>([], 10);
  for (let index = 1; index <= 11; index++) stack.push(index);
  assert.equal(stack.size, 10);
  assert.equal(stack.peek(), 11);
  assert.equal(stack.toArray().at(-1), 2);
});

test("remove deletes an item", () => {
  const stack = RecentSearchStack.fromTopFirst(["Ana", "Bruno", "Carla"]);
  stack.remove("Bruno");
  assert.deepEqual(stack.toArray(), ["Ana", "Carla"]);
});

test("clear empties the stack", () => {
  const stack = RecentSearchStack.fromTopFirst(["Ana", "Bruno"]);
  stack.clear();
  assert.equal(stack.isEmpty, true);
  assert.equal(stack.size, 0);
});

test("fromTopFirst restores display order", () => {
  const stack = RecentSearchStack.fromTopFirst(["Carla", "Bruno", "Ana"]);
  assert.deepEqual(stack.toArray(), ["Carla", "Bruno", "Ana"]);
});
