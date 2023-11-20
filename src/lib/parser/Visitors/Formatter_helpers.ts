import { Expr } from "../Expr";
import { isToken, isWS } from "../helpers";
import { Token } from "../token";
import { TokenType } from "../types";

export function wrapInSpaces(str: string) {
  return ` ${str} `;
}

export function onlyWSTillEnd(idx: number, arr: Array<Expr | Token>): boolean {
  for (let i = idx + 1; i < arr.length; i++) {
    if (!isWS(arr[i])) {
      return false;
    } else {
      const expr = arr[i];
      if (isToken(expr)) {
        if (expr.type === TokenType.EOF || expr.type === TokenType.EOL || expr.type === TokenType.ANTISLASH_EOL) {
          return true;
        } if (expr.type === TokenType.WHITESPACE) {
          continue;
        } else { return false; };
      }
    }
  }
  return true;
}