import { Token } from "./token";
import { TokenType } from "./types";

let hadError = false;

export const getError = () => hadError;
export const setError = (setter: boolean) => (hadError = setter);
export const error = (line: number, message: string) => {
  report(line, "", message);
};
export const report = (line: number, where: string, message: string) => {
  setError(true);
  console.error(`[line ${line}] Error ${where}: ${message}`);
};

export const tokenError = (token: Token, message: string) => {
  if (token.type === TokenType.EOF) {
    report(token.line, " at end", message);
  } else {
    report(token.line, " at '" + token.lexeme + "'", message);
  }
};
export const parserError = (token: Token, message: string) => {
  report(token.line, `at pos.${token.position} - '${token.lexeme}'`, message);
};
