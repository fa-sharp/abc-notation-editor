import {
  Annotation,
  BarLine,
  Beam,
  Beam_contents,
  Chord,
  Comment,
  Decoration,
  Expr,
  Grace_group,
  Info_line,
  Inline_field,
  MultiMeasureRest,
  Music_code,
  Note,
  Nth_repeat,
  Pitch,
  Rest,
  Rhythm,
  ExprSymbol,
  YSPACER,
  music_code,
} from "./Expr";
import { Token } from "./token";
import { TokenType } from "./types";

export function isMusicCode(expr: Expr | Token): expr is Music_code {
  return expr instanceof Music_code;
}

export const isBeam = (expr: Expr | undefined | Token): expr is Beam => {
  return expr instanceof Beam;
};
export const isNote = (expr: Expr | undefined | Token): expr is Note => {
  return expr instanceof Note;
};
export const isBarLine = (expr: Expr | undefined | Token): expr is BarLine => {
  return expr instanceof BarLine;
};
export const isAnnotation = (
  expr: Expr | undefined | Token
): expr is Annotation => {
  return expr instanceof Annotation;
};
export const isGraceGroup = (
  expr: Expr | undefined | Token
): expr is Grace_group => {
  return expr instanceof Grace_group;
};
export const isNthRepeat = (
  expr: Expr | undefined | Token
): expr is Nth_repeat => {
  return expr instanceof Nth_repeat;
};
export const isInline_field = (
  expr: Expr | undefined | Token
): expr is Inline_field => {
  return expr instanceof Inline_field;
};
export const isChord = (expr: Expr | undefined | Token): expr is Chord => {
  return expr instanceof Chord;
};
export const isSymbol = (
  expr: Expr | undefined | Token
): expr is ExprSymbol => {
  return expr instanceof ExprSymbol;
};
export const isMultiMeasureRest = (
  expr: Expr | undefined | Token
): expr is MultiMeasureRest => {
  return expr instanceof MultiMeasureRest;
};
export const isComment = (expr: Expr | undefined | Token): expr is Comment => {
  return expr instanceof Comment;
};
export const isPitch = (expr: Expr | undefined | Token): expr is Pitch => {
  return expr instanceof Pitch;
};
export const isRhythm = (expr: Expr | undefined | Token): expr is Rhythm => {
  return expr instanceof Rhythm;
};
export const isRest = (expr: Expr | undefined | Token): expr is Rest => {
  return expr instanceof Rest;
};
export const isToken = (expr: Expr | undefined | Token): expr is Token => {
  return expr instanceof Token;
};
export const isInfo_line = (
  expr: Expr | undefined | Token
): expr is Info_line => {
  return expr instanceof Info_line;
};
export function isYSPACER(expr: Expr | Token): expr is YSPACER {
  return expr instanceof YSPACER;
}

export const mergeTokens = (tokens: Token[]) => {
  return tokens
    .map((t) => cloneToken(t))
    .reduce((prev, cur, index) => {
      if (index === 0) {
        return prev;
      }
      prev.lexeme = prev.lexeme + cur.lexeme;
      return prev;
    });
};

export const cloneToken = (token: Token) => {
  return new Token(token.type, token.lexeme, null, token.line, token.position);
};

export function stringifyNote(note: Note): string {
  let retStr = "";
  retStr +=
    note.pitch instanceof Rest
      ? note.pitch.rest.lexeme
      : stringifyPitch(note.pitch);
  if (note.rhythm) {
    retStr += stringifyRhythm(note.rhythm);
  }
  return retStr;
}

export function stringifyPitch(pitch: Pitch) {
  let retStr = "";
  retStr += pitch.alteration?.lexeme || "";
  retStr += pitch.noteLetter.lexeme || "";
  retStr += pitch.octave?.lexeme || "";
  return retStr;
}

export function stringifyRhythm(rhythm: Rhythm) {
  let retStr = "";
  retStr += rhythm.numerator || "";
  retStr += rhythm.separator || "";
  retStr += rhythm.denominator || "";
  retStr += rhythm.broken || "";
}

export function followedByWS(expr: music_code) {
  if (expr instanceof Token) {
    return /[ \t]$/.test(expr.lexeme);
  } else {
    return false;
  }
}

export function isBeamContents(e: unknown): e is Beam_contents {
  return (
    e instanceof Token ||
    e instanceof YSPACER ||
    e instanceof Annotation ||
    e instanceof Decoration ||
    e instanceof Note ||
    e instanceof Grace_group ||
    e instanceof Chord ||
    e instanceof ExprSymbol
  );
}

/**
 * Iterate music_code from given index.
 * if any of the expressions is a note, return true.
 * if any of the expressions is a beam breaker, return false.
 */
export function followedByNote(music_code: Array<Expr | Token>, index: number) {
  for (let i = index; i < music_code.length; i++) {
    if (!isBeamContents(music_code[i])) {
      return false;
    } else if (isNote(music_code[i]) || isChord(music_code[i])) {
      return true;
    }
  }
  return false;
}

export function isWS(e: unknown) {
  return (
    e instanceof Token &&
    (e.type === TokenType.WHITESPACE ||
      e.type === TokenType.EOL ||
      e.type === TokenType.EOF ||
      e.type === TokenType.ANTISLASH_EOL)
  );
}

/**
 * if cur expr is a note not immediately followed by WS or beam break,
 * find whether there is another note before a beam breaker or before end of array.
 *
 * Beam breakers are barlines, inline fields, and nth repeats.
 */
export function foundBeam(music_code: Array<Expr | Token>, index: number) {
  /**
   * iterate the array from the given index.
   * if any of the expressions is a note, return true.
   * if any of the expressions is a beam breaker, return false.
   */
  if (
    (isNote(music_code[index]) || isChord(music_code[index])) &&
    !isWS(music_code[index + 1])
  ) {
    return followedByNote(music_code, index + 1);
  } else {
    return false;
  }
}
/**
 * TODO FIX ME
 */
export function isInRange(
  range: { start: number; end: number },
  expr: Expr | Token
): boolean {
  if (isToken(expr)) {
    return range.start >= expr.position && expr.position <= range.end;
  } else {
    return false;
  }
}
