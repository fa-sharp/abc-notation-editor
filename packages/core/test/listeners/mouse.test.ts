import { test, expect } from "vitest";
import { getStaffClickToNoteFn } from "~src/listeners/mouse";

test("Calculates correct note from mouse Y position for treble clef", () => {
  const staffClickToNote = getStaffClickToNoteFn({
    clef: "treble",
    lineGap: 10, // 10 pixels between staff lines
    topLineY: 50, // top staff line is at y=50
  });

  expect(staffClickToNote(40)).toBe("A5");
  expect(staffClickToNote(38)).toBe("A5");
  expect(staffClickToNote(37)).toBe("B5");
  expect(staffClickToNote(60)).toBe("D5");
  expect(staffClickToNote(90)).toBe("E4");
  expect(staffClickToNote(101)).toBe("C4");
  expect(staffClickToNote(105)).toBe("B3");
});

test("Calculates correct note from mouse Y position for bass clef", () => {
  const staffClickToNote = getStaffClickToNoteFn({
    clef: "bass",
    lineGap: 10, // 10 pixels between staff lines
    topLineY: 50, // top staff line is at y=50
  });

  expect(staffClickToNote(30)).toBe("E4");
  expect(staffClickToNote(40)).toBe("C4");
  expect(staffClickToNote(50)).toBe("A3");
  expect(staffClickToNote(60)).toBe("F3");
  expect(staffClickToNote(101)).toBe("E2");
  expect(staffClickToNote(106)).toBe("D2");
});
