export const roundToN = (num: number, decimals = 5) =>
  //@ts-expect-error js numbers & rounding weirdness
  +(Math.round(num + `e+${decimals}`) + `e-${decimals}`);

export const equalUpToN = (a: number, b: number, precision = 0.0001) =>
  Math.abs(a - b) < precision;
