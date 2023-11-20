import { error } from "./error";
import { Token } from "./token";
import { TokenType } from "./types";

export class Scanner {
  private source: string;
  private tokens: Array<Token> = [];
  private start = 0;
  private current = 0;
  private line = 0;
  constructor(source: string) {
    this.source = source;
  }

  scanTokens = (): Array<Token> => {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }
    this.tokens.push(
      new Token(TokenType.EOF, "\n", null, this.line, this.start)
    );
    return this.tokens;
  };

  private scanToken() {
    const c = this.advance();
    switch (c) {
      case "\\":
        if (this.peek() === "\n" && !this.isAtEnd()) {
          this.advance();
          this.addToken(TokenType.ANTISLASH_EOL);
        } else {
          error(this.line, this.errorMessage("expected an end of line"));
        }
        break;
      case "'":
        while (this.peek() === "'" && !this.isAtEnd()) {
          this.advance();
        }
        this.addToken(TokenType.APOSTROPHE);
        break;
      case "|": {
        const pkd = this.peek();
        if (
          // TODO for now, only allow one digit after barline
          (pkd === ":" || pkd === "|" || pkd === "]" || /[0-9]/.test(pkd)) &&
          !this.isAtEnd()
        ) {
          this.advance();
          switch (pkd) {
            case ":":
              this.addToken(TokenType.BAR_COLON);
              break;
            case "|":
              this.addToken(TokenType.BAR_DBL);
              break;
            case "]":
              this.addToken(TokenType.BAR_RIGHTBRKT);
              break;
            default: {
              if (/[0-9]/.test(pkd)) {
                this.addToken(TokenType.BAR_DIGIT);
              }
            }
          }
        } else {
          this.addToken(TokenType.BARLINE);
        }
        break;
      }
      // is caret always a sharp?
      case "^":
        this.addToken(this.match("^") ? TokenType.SHARP_DBL : TokenType.SHARP);
        break;
      case ":": {
        const pkd = this.peek();
        if ((pkd === "|" || pkd === ":") && !this.isAtEnd()) {
          this.advance();
          if (pkd === "|") {
            if (/[0-9]/.test(this.peek())) {
              this.advance();
              this.addToken(TokenType.COLON_BAR_DIGIT);
            } else {
              this.addToken(TokenType.COLON_BAR);
            }
          } else if (pkd === ":") {
            this.addToken(TokenType.COLON_DBL);
          }
        } else {
          this.addToken(TokenType.COLON);
        }
        break;
      }
      case ",":
        while (this.peek() === "," && !this.isAtEnd()) {
          this.advance();
        }
        this.addToken(TokenType.COMMA);
        break;
      case "%": {
        const pkd = this.peek();
        while (this.peek() !== "\n" && !this.isAtEnd()) {
          this.advance();
        }
        this.addToken(
          pkd === "%" ? TokenType.STYLESHEET_DIRECTIVE : TokenType.COMMENT
        );
        break;
      }
      case ".":
        this.addToken(TokenType.DOT);
        break;
      case "\n":
        this.addToken(TokenType.EOL);
        this.line++;
        break;
      case "_":
        if (this.peek() === "_") {
          this.advance();
          this.addToken(TokenType.FLAT_DBL);
        } else {
          this.addToken(TokenType.FLAT);
        }
        break;
      case "♭":
        this.addToken(TokenType.FLAT);
        break;
      case "𝄫":
        this.addToken(TokenType.FLAT_DBL);
        break;
      case ">":
        while (this.peek() === ">" && !this.isAtEnd()) {
          this.advance();
        }
        this.addToken(TokenType.GREATER);
        break;
      case "[": {
        const pkd = this.peek();
        if (pkd === "|") {
          this.advance();
          this.addToken(TokenType.LEFTBRKT_BAR);
        } else if (this.isDigit(pkd)) {
          while (this.isDigit(this.peek())) {
            this.advance();
          }
          this.addToken(TokenType.LEFTBRKT_NUMBER);
        } else {
          this.addToken(TokenType.LEFTBRKT);
        }
        break;
      }
      case "{":
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case "(":
        if (this.isDigit(this.peek())) {
          while (this.isDigit(this.peek())) {
            this.advance();
          }
          this.addToken(TokenType.LEFTPAREN_NUMBER);
        } else {
          this.addToken(TokenType.LEFTPAREN);
        }
        break;
      case "<":
        while (this.peek() === "<" && !this.isAtEnd()) {
          this.advance();
        }
        this.addToken(TokenType.LESS);
        break;
      case "-":
        this.addToken(TokenType.MINUS);
        break;
      case "♮":
      case "=":
        this.addToken(TokenType.NATURAL);
        break;
      case "+":
        if (this.peek() === ":") {
          this.advance();
          this.addToken(TokenType.PLUS_COLON);
        } else {
          this.addToken(TokenType.PLUS);
        }
        break;
      case ")":
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case "}":
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case "]":
        this.addToken(TokenType.RIGHT_BRKT);
        break;
      case "♯":
        this.addToken(TokenType.SHARP);
        break;
      case "𝄪":
        this.addToken(TokenType.SHARP_DBL);
        break;
      case "/":
        while (this.peek() === "/" && !this.isAtEnd()) {
          this.advance();
        }
        this.addToken(TokenType.SLASH);
        break;
      case "!":
        while (this.peek() !== "!" && !this.isAtEnd()) {
          this.advance();
        }
        this.advance();
        this.addToken(TokenType.SYMBOL);
        break;
      case "~":
        this.addToken(TokenType.TILDE);
        break;
      case " ":
      case "\r":
      case "\t":
        // Don't Ignore whitespace, the standard is space-sensitive
        this.addToken(TokenType.WHITESPACE);
        break;
      case '"':
        this.string();
        break;
      case "$":
        this.addToken(TokenType.DOLLAR);
        break;
      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          const pkd = this.peek();
          if (this.match(":")) {
            this.addToken(TokenType.LETTER_COLON);
          } else if (/[a-gA-G]/.test(c)) {
            this.addToken(TokenType.NOTE_LETTER);
          } else {
            this.addToken(TokenType.LETTER);
          }
        } else if (this.isReservedChar(c)) {
          this.addToken(TokenType.RESERVED_CHAR);
        } else {
          const curLine = this.source.split("\n")[this.line];
          error(this.line, this.errorMessage(c));
        }
        break;
    }
  }

  private errorMessage(scannerMessage: string = "") {
    // find the line and the current character
    const line = this.source.split("\n")[this.line];
    const char = this.source[this.current];
    let message = `Scanner Error: unexpected character: ${scannerMessage}\n${line}\n`;
    //find the line break preceding the current character
    const lineBreak = this.source.lastIndexOf("\n", this.current);
    //find the position of the current character in the line
    const charPos = this.current - lineBreak;
    //add a caret to the message
    const caret = " ".repeat(charPos) + "^";
    message += caret;
    return message;
  }

  private number() {
    // only INTEGERS
    while (this.isDigit(this.peek())) {
      this.advance();
    }
    this.addToken(
      TokenType.NUMBER,
      Number(this.source.substring(this.start, this.current))
    );
  }
  private string() {
    //jump to end of string
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === "\n") {
        this.line++;
      }
      this.advance();
    }
    if (this.isAtEnd()) {
      error(this.line, this.errorMessage("Unterminated string"));
      return;
    }
    // the closing ".
    this.advance();
    // trim the surrounding quotes
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) {
      return false;
    }
    if (this.source.charAt(this.current) !== expected) {
      return false;
    }
    this.current++;
    return true;
  }

  private peek() {
    if (this.isAtEnd()) {
      return "\0";
    }
    return this.source.charAt(this.current);
  }

  // could provided peek() with the capability to
  // have arbitrary size lookahead, but no.
  private peekNext() {
    if (this.current + 1 >= this.source.length) {
      return "\0";
    }
    return this.source.charAt(this.current + 1);
  }

  private isReservedChar(c: string) {
    //# * ; ? @
    return /[#*;?@]/.test(c);
  }
  private isAlpha(c: string) {
    return (
      (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_" || c === "&"
    );
  }

  private isAlphaNumeric(c: string) {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private isDigit(c: string) {
    return c >= "0" && c <= "9";
  }

  private isAtEnd() {
    return this.current >= this.source.length;
  }

  private advance() {
    return this.source.charAt(this.current++);
  }

  private addToken(type: TokenType, literal?: any | null) {
    const text = this.source.substring(this.start, this.current);
    const lineBreak =
      this.line === 0 ? 0 : this.source.lastIndexOf("\n", this.current) + 1;

    const charPos = this.start - lineBreak;
    this.tokens.push(
      new Token(type, text, literal || null, this.line, charPos)
    );
  }
}
