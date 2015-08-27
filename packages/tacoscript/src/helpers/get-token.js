import Tokenizer from "babylon/lib/tokenizer";
import State from "babylon/lib/tokenizer/state";
import { isKeyword } from "babylon/lib/util/identifier";

var tokenizer = null;

export default function getTokenFromString(s) {
  if (tokenizer == null) { tokenizer = new MicroTokenizer(); }
  return tokenizer.getTokenFromString(s);
}

export class MicroTokenizer {
  constructor() {
    this.state = null;
    this.input = null;
  }

  getTokenFromString(input) {
    this.input = input;
    this.state = new State();
    this.state.init(input);

    this.skipSpace();

    if (this.state.comments.length > 0) {
      let comment = this.state.comments[0];
      this.state.type = comment.type;
      this.state.value = comment.value;
    } else if (this.state.pos >= this.input.length) {
      this.state.type = "Whitespace";
      this.state.value = input;
    } else {
      this.readToken(this.fullCharCodeAtPos());
    }

    // even though this function is called "getToken...", we return the state
    // since we don't return a full token with source location etc., and the
    // state is what is used to generate a full token anyways.
    var state = this.state;
    this.state = null;
    delete state.start;
    delete state.end;
    delete state.startLoc;
    delete state.endLoc;
    return state;
  }

  finishToken(type, val) {
    this.state.type = type;
    this.state.value = val;
    if (this.state.pos !== this.input.length) {
      this.raise(0, "Did not consume entire string");
    }
  }

  addComment(/*comment*/) {}

  nextToken() {
    if (this.state.pos >= this.input.length) { return; }
    this.readToken(this.fullCharCodeAtPos());
  }

  raise(pos, message) {
    throw new SyntaxError(message);
  }
}

MicroTokenizer.prototype.isKeyword = isKeyword;
MicroTokenizer.prototype.readToken = Tokenizer.prototype.readToken;
MicroTokenizer.prototype.getTokenFromCode = Tokenizer.prototype.getTokenFromCode;
MicroTokenizer.prototype.fullCharCodeAtPos = Tokenizer.prototype.fullCharCodeAtPos;
MicroTokenizer.prototype.readNumber = Tokenizer.prototype.readNumber;
MicroTokenizer.prototype.readInt = Tokenizer.prototype.readInt;
MicroTokenizer.prototype.readRadixNumber = Tokenizer.prototype.readRadixNumber;
MicroTokenizer.prototype.readString = Tokenizer.prototype.readString;
MicroTokenizer.prototype.readWord = Tokenizer.prototype.readWord;
MicroTokenizer.prototype.readWord1 = Tokenizer.prototype.readWord1;
MicroTokenizer.prototype.readToken_dot = Tokenizer.prototype.readToken_dot;
MicroTokenizer.prototype.readToken_slash = Tokenizer.prototype.readToken_slash;
MicroTokenizer.prototype.readToken_mult_modulo = Tokenizer.prototype.readToken_mult_modulo;
MicroTokenizer.prototype.readToken_pipe_amp = Tokenizer.prototype.readToken_pipe_amp;
MicroTokenizer.prototype.readToken_caret = Tokenizer.prototype.readToken_caret;
MicroTokenizer.prototype.readToken_plus_min = Tokenizer.prototype.readToken_plus_min;
MicroTokenizer.prototype.readToken_lt_gt = Tokenizer.prototype.readToken_lt_gt;
MicroTokenizer.prototype.readToken_eq_excl = Tokenizer.prototype.readToken_eq_excl;
MicroTokenizer.prototype.finishOp = Tokenizer.prototype.finishOp;

MicroTokenizer.prototype.skipSpace = Tokenizer.prototype.skipSpace;
MicroTokenizer.prototype.pushComment = Tokenizer.prototype.pushComment;
MicroTokenizer.prototype.skipLineComment = Tokenizer.prototype.skipLineComment;
MicroTokenizer.prototype.skipBlockComment = Tokenizer.prototype.skipBlockComment;
