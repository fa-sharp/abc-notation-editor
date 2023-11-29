import { ABCHeaders } from "~src/parsing/headers";
import { roundToN } from "./numbers";

export const getMeasureDurationFromTimeSig = (
  timeSig: ABCHeaders["timeSig"]
) => {
  if (typeof timeSig.upper === "number" && typeof timeSig.lower === "number")
    return roundToN(timeSig.upper / timeSig.lower);
  throw new Error("Unsupported time signature: " + timeSig.name);
};
