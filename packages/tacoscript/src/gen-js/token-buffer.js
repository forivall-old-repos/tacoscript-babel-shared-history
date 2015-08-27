import isBoolean from "lodash/lang/isBoolean";
import includes from "lodash/collection/includes";
import isNumber from "lodash/lang/isNumber";
import isArray from "lodash/lang/isArray";
import isString from "lodash/lang/isString";

import getTokenFromString from "../helpers/get-token";
import { Token } from "babylon/lib/tokenizer";

/**
 * Buffer for collecting generated output.
 */

export default class TokenBuffer {
  constructor(position) {
    this.position = position;
    this.tokens   = [];
    this._buf     = "";
  }

  /**
   * Get the buffer of tokens as a string.
   */

  get() {
    return this._buf;
  }

  /**
   * Add a semicolon to the buffer.
   */

  semicolon() {
    this.push(";");
  }

  /**
   * Ensure last character is a semicolon.
   */

  ensureSemicolon() {
    if (!this.isLast(";")) this.semicolon();
  }

  /**
   * Add a right brace to the buffer.
   */

  rightBrace() {
    this.push("}");
  }

  /**
   * Add a keyword to the buffer.
   */

  keyword(name) {
    this.push(name);
    this.space();
  }

  /**
   * Add a space to the buffer unless it is compact (override with force).
   */

  space(force?) {
    if (force || this.buf.buf && !this.isLast(" ") && !this.isLast("\n")) {
      this.push(" ");
    }
  }

  /**
   * Remove the last character.
   */

  removeLast(cha) {
    if (!this.isLast(cha)) return;

    this.buf.buf = this.buf.buf.substr(0, this.buf.buf.length - 1);
    this.position.unshift(cha);
  }

  /**
   * Set some state that will be modified if a newline has been inserted before any
   * non-space characters.
   *
   * This is to prevent breaking semantics for terminatorless separator nodes. eg:
   *
   *    return foo;
   *
   * returns `foo`. But if we do:
   *
   *   return
   *   foo;
   *
   *  `undefined` will be returned and not `foo` due to the terminator.
   */

  startTerminatorless() {
    return this.parenPushNewlineState = {
      printed: false
    };
  }

  /**
   * Print an ending parentheses if a starting one has been printed.
   */

  endTerminatorless(state) {
    if (state.printed) {
      this.dedent();
      this.newline();
      this.push(")");
    }
  }

  /**
   * Add a newline (or many newlines), maintaining formatting.
   * Strips multiple newlines if removeLast is true.
   */

  newline(i, removeLast) {
    if (this.format.compact || this.format.retainLines) return;

    if (this.format.concise) {
      this.space();
      return;
    }

    removeLast = removeLast || false;

    if (isNumber(i)) {
      i = Math.min(2, i);

      if (this.endsWith("{\n") || this.endsWith(":\n")) i--;
      if (i <= 0) return;

      while (i > 0) {
        this._newline(removeLast);
        i--;
      }
      return;
    }

    if (isBoolean(i)) {
      removeLast = i;
    }

    this._newline(removeLast);
  }

  /**
   * Adds a newline unless there is already two previous newlines.
   */

  _newline(removeLast) {
    // never allow more than two lines
    if (this.endsWith("\n\n")) return;

    // remove the last newline
    if (removeLast && this.isLast("\n")) this.removeLast("\n");

    this.removeLast(" ");
    this._removeSpacesAfterLastNewline();
    this._push("\n");
  }

  /**
   * If buffer ends with a newline and some spaces after it, trim those spaces.
   */

  _removeSpacesAfterLastNewline() {
    var lastNewlineIndex = this.buf.buf.lastIndexOf("\n");
    if (lastNewlineIndex === -1) {
      return;
    }

    var index = this.buf.buf.length - 1;
    while (index > lastNewlineIndex) {
      if (this.buf.buf[index] !== " ") {
        break;
      }

      index--;
    }

    if (index === lastNewlineIndex) {
      this.buf.buf = this.buf.buf.substring(0, index + 1);
    }
  }

  /**
   * Push a string token(s) to the buffer, maintaining indentation and newlines.
   */

  push(...tokens) {
    for (let token of (tokens: Array)) {
      this._push(token);
    }
  }

  /**
   * Push a string to the buffer.
   */

  _push(token) {
    if (isString(token)) {
      token = new Token(getTokenFromString(token));
    }

    // see startTerminatorless() instance method
    var parenPushNewlineState = this.parenPushNewlineState;
    if (parenPushNewlineState && token.type === 'Whitespace') {
      let str = token.value;
      for (var i = 0; i < str.length; i++) {
        var cha = str[i];

        // we can ignore spaces since they wont interupt a terminatorless separator
        if (cha === " ") continue;

        this.parenPushNewlineState = null;

        if (cha === "\n") {
          // we're going to break this terminator expression so we need to add a parentheses
          this._push1("(");
          this.indent();
          parenPushNewlineState.printed = true;
        }
      }
    }

    // TODO: position will be updated when tokens are serialized
    // this.position.push(token);
    this.tokens.push(token);
  }

  /**
   * Test if the buffer ends with a string.
   */

  endsWith(str, buf = this.buf.buf) {
    return buf.slice(-str.length) === str;
  }

  /**
   * Test if a character is last in the buffer.
   */

  isLast(cha) {
    var buf = this.buf.buf;
    var last = buf[buf.length - 1];

    if (Array.isArray(cha)) {
      return includes(cha, last);
    } else {
      return cha === last;
    }
  }
}
