import { expect, suite } from "vitest";
import { parseAbcHeaders } from "~src/parsing/headers";

suite("Correctly parses info from basic ABC header", (test) => {
  test("C Major, treble clef, 4/4", () => {
    const abc = "X:1\nL:1/8\nM:4/4\nK:C clef=treble    \nA B C2";

    const { keySig, timeSig, clef } = parseAbcHeaders(abc);
    expect(keySig.tonic).toBe("C");
    expect(keySig.type).toBe("major");
    expect(timeSig.upper).toBe(4);
    expect(timeSig.lower).toBe(4);
    expect(clef).toBe("treble");
  });

  test("E Major, bass clef, 3/4 with random spacing", () => {
    const abc = "X:1\nL: 1/8\nM:3/4 \nK:E clef=    bass    \nA B C2";

    const { keySig, timeSig, clef } = parseAbcHeaders(abc);
    expect(keySig.tonic).toBe("E");
    expect(keySig.type).toBe("major");
    expect(timeSig.upper).toBe(3);
    expect(timeSig.lower).toBe(4);
    expect(clef).toBe("bass");
  });

  test("B minor, bass clef, 3/8", () => {
    const abc = "X:1\nL:1/8\nM:3/8 \nK:Bm clef=bass \nA B C2";

    const { keySig, timeSig, clef } = parseAbcHeaders(abc);
    expect(keySig.tonic).toBe("B");
    expect(keySig.type).toBe("minor");
    expect(timeSig.upper).toBe(3);
    expect(timeSig.lower).toBe(8);
    expect(clef).toBe("bass");
  });

  test("Bb minor, no clef given (should default to treble), 2/2", () => {
    const abc = "X:1\nL:1/8\nM:2/2 \nK:Bbm \nA B C2";

    const { keySig, timeSig, clef } = parseAbcHeaders(abc);
    expect(keySig.tonic).toBe("Bb");
    expect(keySig.type).toBe("minor");
    expect(timeSig.upper).toBe(2);
    expect(timeSig.lower).toBe(2);
    expect(clef).toBe("treble");
  });
});
