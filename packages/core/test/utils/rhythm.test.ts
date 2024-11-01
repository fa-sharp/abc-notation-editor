import { expect, test } from "vitest";
import { Rhythm } from "~src";
import { getAbcRhythm } from "~src/utils/rhythm";

test("Returns correct ABC rhythms for given rhythmic values", () => {
  expect(getAbcRhythm(Rhythm.Half)).toBe("4");
  expect(getAbcRhythm(Rhythm.Half, true)).toBe("6");
  expect(getAbcRhythm(Rhythm.Whole)).toBe("8");
  expect(getAbcRhythm(Rhythm.Eighth, true)).toBe("3/2");
});
