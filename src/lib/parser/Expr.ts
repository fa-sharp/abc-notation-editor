import { Token } from "./token";
import { TokenType } from "./types";

export interface Visitor<R> {
  visitAnnotationExpr(expr: Annotation): R;
  visitBarLineExpr(expr: BarLine): R;
  visitChordExpr(expr: Chord): R;
  visitCommentExpr(expr: Comment): R;
  visitDecorationExpr(expr: Decoration): R;
  visitFileHeaderExpr(expr: File_header): R;
  visitFileStructureExpr(expr: File_structure): R;
  visitGraceGroupExpr(expr: Grace_group): R;
  visitInfoLineExpr(expr: Info_line): R;
  visitInlineFieldExpr(expr: Inline_field): R;
  visitLyricSectionExpr(expr: Lyric_section): R;
  visitMultiMeasureRestExpr(expr: MultiMeasureRest): R;
  visitMusicCodeExpr(expr: Music_code): R;
  visitNoteExpr(expr: Note): R;
  visitNthRepeatExpr(expr: Nth_repeat): R;
  visitPitchExpr(expr: Pitch): R;
  visitRestExpr(expr: Rest): R;
  visitRhythmExpr(expr: Rhythm): R;
  visitSymbolExpr(expr: ExprSymbol): R;
  visitTuneBodyExpr(expr: Tune_Body): R;
  visitTuneExpr(expr: Tune): R;
  visitTuneHeaderExpr(expr: Tune_header): R;
  visitYSpacerExpr(expr: YSPACER): R;
  visitBeamExpr(expr: Beam): R;
}

export abstract class Expr {
  abstract accept<R>(visitor: Visitor<R>): R;
}

export class File_structure extends Expr {
  file_header: File_header | null;
  tune: Array<Tune>;
  constructor(file_header: File_header | null, tune: Array<Tune>) {
    super();
    this.file_header = file_header;
    this.tune = tune;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitFileStructureExpr(this);
  }
}

export class Pitch extends Expr {
  alteration?: Token;
  noteLetter: Token;
  octave?: Token;
  constructor({
    alteration,
    noteLetter,
    octave,
  }: {
    alteration?: Token;
    noteLetter: Token;
    octave?: Token;
  }) {
    super();
    this.alteration = alteration;
    this.noteLetter = noteLetter;
    this.octave = octave;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitPitchExpr(this);
  }
}

export class File_header extends Expr {
  text: string;
  tokens: Array<Token>;
  constructor(text: string, tokens: Array<Token>) {
    super();
    this.text = text;
    this.tokens = tokens;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitFileHeaderExpr(this);
  }
}

export class Info_line extends Expr {
  key: Token;
  value: Array<Token>;
  constructor(tokens: Array<Token>) {
    super();
    this.key = tokens[0]!;
    tokens.shift();
    // merge the tokens into a string token, and push them into the value
    let result = "";
    let index = -1;
    while (index < tokens.length - 1) {
      index += 1;
      if (tokens[index]!.type === TokenType.COMMENT) {
        break;
      }
      result += tokens[index]!.lexeme;
    }
    const value = Array<Token>();
    value.push(
      new Token(
        TokenType.STRING,
        result,
        null,
        tokens[0]!.line,
        tokens[0]!.position
      )
    );
    if (tokens[index]!.type === TokenType.COMMENT) {
      value.push(tokens[index]!);
    }
    this.value = value;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitInfoLineExpr(this);
  }
}

export class Lyric_section extends Expr {
  info_lines: Array<Info_line>;
  constructor(info_lines: Array<Info_line>) {
    super();
    this.info_lines = info_lines;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitLyricSectionExpr(this);
  }
}
export class Tune_header extends Expr {
  info_lines: Array<Info_line>;
  constructor(info_lines: Array<Info_line>) {
    super();
    this.info_lines = info_lines;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitTuneHeaderExpr(this);
  }
}
export class Comment extends Expr {
  text: string;
  token: Token;
  constructor(text: string, token: Token) {
    super();
    this.text = text;
    this.token = token;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitCommentExpr(this);
  }
}
export type tune_body_code = Comment | Info_line | music_code | Music_code;

export class Tune extends Expr {
  tune_header: Tune_header;
  tune_body?: Tune_Body;
  constructor(tune_header: Tune_header, tune_body?: Tune_Body) {
    super();
    this.tune_header = tune_header;
    this.tune_body = tune_body;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitTuneExpr(this);
  }
}
export class Rhythm extends Expr {
  numerator?: Token | null;
  separator?: Token;
  denominator?: Token | null;
  broken?: Token | null;
  constructor(
    numerator: Token | null,
    separator?: Token,
    denominator?: Token | null,
    broken?: Token | null
  ) {
    super();
    this.numerator = numerator;
    this.separator = separator;
    this.denominator = denominator;
    this.broken = broken;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitRhythmExpr(this);
  }
}

export class Rest extends Expr {
  rest: Token;
  constructor(rest: Token) {
    super();
    this.rest = rest;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitRestExpr(this);
  }
}

export class Note extends Expr {
  pitch: Pitch | Rest;
  rhythm?: Rhythm;
  tie?: boolean;
  constructor(pitch: Pitch | Rest, rhythm?: Rhythm, tie?: boolean) {
    super();
    this.pitch = pitch;
    this.rhythm = rhythm;
    this.tie = tie || false;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitNoteExpr(this);
  }
}
export class MultiMeasureRest extends Expr {
  rest: Token;
  length?: Token;
  constructor(rest: Token, length?: Token) {
    super();
    this.rest = rest;
    this.length = length;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitMultiMeasureRestExpr(this);
  }
}
export class ExprSymbol extends Expr {
  symbol: Token;
  constructor(symbol: Token) {
    super();
    this.symbol = symbol;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitSymbolExpr(this);
  }
}
export class Grace_group extends Expr {
  notes: Array<Note>;
  isAccacciatura?: boolean;
  constructor(notes: Array<Note>, isAccacciatura?: boolean) {
    super();
    this.notes = notes;
    this.isAccacciatura = isAccacciatura;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitGraceGroupExpr(this);
  }
}
export class Inline_field extends Expr {
  field: Token;
  text: Array<Token>;
  constructor(field: Token, text: Array<Token>) {
    super();
    this.field = field;
    this.text = text;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitInlineFieldExpr(this);
  }
}

export class Chord extends Expr {
  contents: Array<Note | Token | Annotation>;
  rhythm?: Rhythm;
  constructor(contents: Array<Note | Token | Annotation>, rhythm?: Rhythm) {
    super();
    this.contents = contents;
    this.rhythm = rhythm;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitChordExpr(this);
  }
}

export class Nth_repeat extends Expr {
  repeat: Token;
  constructor(repeat: Token) {
    super();
    this.repeat = repeat;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitNthRepeatExpr(this);
  }
}

export class Tune_Body extends Expr {
  sequence: Array<tune_body_code | Token>;
  constructor(sequence: Array<tune_body_code>) {
    super();
    this.sequence = sequence;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitTuneBodyExpr(this);
  }
}

export class Annotation extends Expr {
  text: Token;
  constructor(text: Token) {
    super();
    this.text = text;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitAnnotationExpr(this);
  }
}

export class BarLine extends Expr {
  barline: Token;
  constructor(barline: Token) {
    super();
    this.barline = barline;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitBarLineExpr(this);
  }
}

export type music_code =
  | Token
  | YSPACER
  | BarLine
  | Annotation
  | Decoration
  | Note
  | Grace_group
  | Nth_repeat
  | Inline_field
  | Chord
  | ExprSymbol
  | MultiMeasureRest
  | Beam;

export class Music_code extends Expr {
  contents: Array<music_code>;
  constructor(contents: Array<music_code>) {
    super();
    this.contents = contents;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitMusicCodeExpr(this);
  }
}

export type Beam_contents =
  | Token
  | YSPACER
  | Annotation
  | Decoration
  | Note
  | Grace_group
  | Chord
  | ExprSymbol;

export class Beam extends Expr {
  contents: Array<Beam_contents>;
  constructor(contents: Array<Beam_contents>) {
    super();
    this.contents = contents;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitBeamExpr(this);
  }
}
export class Decoration extends Expr {
  decoration: Token;
  constructor(decoration: Token) {
    super();
    this.decoration = decoration;
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitDecorationExpr(this);
  }
}
export class YSPACER extends Expr {
  number?: Token | null;
  ySpacer: Token;
  constructor(ySpacer: Token, number?: Token) {
    super();
    this.ySpacer = ySpacer;
    if (number) {
      this.number = number;
    }
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitYSpacerExpr(this);
  }
}
