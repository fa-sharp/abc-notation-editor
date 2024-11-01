import { expect, test } from "vitest";
import { History } from "~src/utils/history";

test("undo works as expected", () => {
  const history = new History();
  history.addEdit("", "ab^cd");
  history.addEdit("ab^cd", "ab=cd");

  let currentAbc = "ab=cd";
  currentAbc = history.undo(currentAbc);
  expect(currentAbc).toBe("ab^cd");
  currentAbc = history.undo(currentAbc);
  expect(currentAbc).toBe("");
  expect(history.prevEdit).toBeUndefined();
});

test("redo works as expected", () => {
  const history = new History();
  history.addEdit("", "ab^cd");
  history.addEdit("ab^cd", "ab=cd");

  let currentAbc = "ab=cd";
  currentAbc = history.undo(currentAbc);
  currentAbc = history.undo(currentAbc);
  currentAbc = history.redo(currentAbc);
  expect(currentAbc).toBe("ab^cd");
  currentAbc = history.redo(currentAbc);
  expect(currentAbc).toBe("ab=cd");
  expect(history.nextEdit).toBeUndefined();
});
