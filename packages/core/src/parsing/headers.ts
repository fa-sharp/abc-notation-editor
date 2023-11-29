import type { MajorKey, MinorKey } from "@tonaljs/key";
import type { TimeSignature as ITimeSignature } from "@tonaljs/time-signature";
import { Key, TimeSignature } from "tonal";
import { Clef } from "~src/types/constants";

export type KeySignatureType = MajorKey | MinorKey;
export type TimeSignatureType = ITimeSignature;

const headerRegex = /^.:/;

const testIsHeader = (str: string) => headerRegex.test(str);
const getRawValueFromHeader = (header: string) =>
  header.replace(headerRegex, "").trim();

const supportedClefs = Object.values(Clef) as string[];
const getSupportedClef = (rawClef: string): Clef =>
  supportedClefs.includes(rawClef) ? (rawClef as Clef) : Clef.Treble;

const isMajorKey = (keyValue: string) => keyValue.at(-1) !== "m";

export const parseAbcHeaders = (
  abc: string
): {
  clef: Clef;
  keySig: KeySignatureType;
  timeSig: TimeSignatureType;
} => {
  const headers = abc.trim().split("\n").filter(testIsHeader);

  const rawTimeSig = headers.find((h) => h.startsWith("M:")) || "M:4/4";
  const [rawKeySig = "K:C", rawClef = "treble"] =
    headers.find((h) => h.startsWith("K:"))?.split(" clef=", 2) || [];

  const timeSig = TimeSignature.get(getRawValueFromHeader(rawTimeSig));

  const clef = getSupportedClef(rawClef.trim());

  const keyValue = getRawValueFromHeader(rawKeySig);
  const keySig = isMajorKey(keyValue)
    ? Key.majorKey(keyValue)
    : Key.minorKey(keyValue.replace("m", ""));

  return { timeSig, keySig, clef };
};
