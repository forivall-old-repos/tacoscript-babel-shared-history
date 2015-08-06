import repeating from "repeating";
import trimRight from "trim-right";
import isBoolean from "lodash/lang/isBoolean";
import includes from "lodash/collection/includes";
import isNumber from "lodash/lang/isNumber";
import StringStream from "../helpers/str-stream"

/**
 * Buffer for collecting generated output.
 */

export default class Buffer {
  constructor(position, format) {
    this.position = position;
    this._indent  = format.indent.base;
    this.format   = format;
    this.buf      = new StringStream();
  }

  /**
   * Get the current trimmed buffer.
   */

  get() {
    return trimRight(this.buf);
  }

  /**
   * Get the current indent.
   */

  getIndent() {
    if (this.format.compact || this.format.concise) {
      return "";
    } else {
      return repeating(this.format.indent.style, this._indent);
    }
  }

  /**
   * Get the current indent size.
   */

  indentSize() {
    return this.getIndent().length;
  }

  /**
   * Increment indent size.
   */

  indent() {
    this._indent++;
  }

  /**
   * Decrement indent size.
   */

  dedent() {
    this._indent--;
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

    this.buf.buf = this.buf.buf.substr(0, this.buf.length - 1);
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
   * Push a string to the buffer, maintaining indentation and newlines.
   */

  push(str) {
    if (this._indent && str !== "\n") {
      // we have an indent level and we aren't pushing a newline
      var indent = this.getIndent();

      // replace all newlines with newlines with the indentation
      str = str.replace(/\n/g, `\n${indent}`);

    }

    this._push(str);
  }

  /**
   * Push a string to the buffer.
   */

  _push(str) {
    // see startTerminatorless() instance method
    var parenPushNewlineState = this.parenPushNewlineState;
    if (parenPushNewlineState) {
      for (var i = 0; i < str.length; i++) {
        var cha = str[i];

        // we can ignore spaces since they wont interupt a terminatorless separator
        if (cha === " ") continue;

        this.parenPushNewlineState = null;

        if (cha === "\n") {
          // we're going to break this terminator expression so we need to add a parentheses
          this._push("(");
          this.indent();
          parenPushNewlineState.printed = true;
        }
      }
    }

    this.position.push(str);
    this.buf.write(str);
  }

  /**
   * Test if the buffer ends with a string.
   */

  endsWith(str, buf = this.buf.buf) {
    return buf.buf.slice(-str.length) === str;
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
