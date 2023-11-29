export const roundToN = (num: number, decimals = 5) =>
  //@ts-expect-error js numbers & rounding weirdness
  +(Math.round(num + `e+${decimals}`) + `e-${decimals}`);
