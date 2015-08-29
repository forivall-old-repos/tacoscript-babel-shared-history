import Whitespace from "./whitespace";
import repeating from "repeating";
import SourceMap from "./source-map";
import Position from "./position";
import TokenBuffer from "./token-buffer";
import extend from "lodash/object/extend";
import each from "lodash/collection/each";
import n from "./node";
import * as t from "../types";
import { types as tt } from "babylon/lib/tokenizer/types";

import isArray from "lodash/lang/isArray";

/**
 * Babel's code generator, turns an ast into code, maintaining sourcemaps,
 * user preferences, and valid output.
 */

class CodeGenerator {
  constructor(ast, opts, code) {
    opts = opts || {};

    this.comments = ast.comments || [];
    this.tokens   = ast.tokens || [];
    this.opts     = opts;
    this.ast      = ast;

    this.whitespace = new Whitespace(this.tokens);
    this.position   = new Position;
    this.map        = new SourceMap(this.position, opts, code);
    this.buffer     = new TokenBuffer(this.position, code);
  }

  /**
   * All node generators.
   */

  static generators = {
    templateLiterals: require("./generators/template-literals"),
    comprehensions:   require("./generators/comprehensions"),
    expressions:      require("./generators/expressions"),
    statements:       require("./generators/statements"),
    classes:          require("./generators/classes"),
    methods:          require("./generators/methods"),
    modules:          require("./generators/modules"),
    types:            require("./generators/types"),
    flow:             require("./generators/flow"),
    base:             require("./generators/base"),
    jsx:              require("./generators/jsx")
  };

  /**
   * Generate code and sourcemap from ast.
   *
   * Appends comments that weren't attached to any node to the end of the generated output.
   */

  generate() {
    var ast = this.ast;

    this.print(ast);

    return {
      map:  this.map.get(),
      code: this.buffer.get()
    };
  }

  /**
   * Catch up to this node's first token if we're behind
   */

  catchUp(node) {
    // catch up to this nodes first token if we're behind
    // TODO
  }

  /**
   * Print (Tokenize) a plain node.
   */

  print(node, parent, opts = {}) {
    if (!node) return;

    if (!this[node.type]) {
      throw new ReferenceError(`unknown node of type ${JSON.stringify(node.type)} with constructor ${JSON.stringify(node && node.constructor.name)}`);
    }

    var needsParens = n.needsParens(node, parent);
    if (needsParens) this.push("(");

    this.printLeadingComments(node, parent);

    this.catchUp(node);

    // this.printLeadingTokens(node, parent);

    if (opts.before) opts.before();
    this.map.mark(node, "start");

    this[node.type](node, parent);

    if (needsParens) this.push(")");

    this.map.mark(node, "end");
    if (opts.after) opts.after();

    // this.printTrailingTokens(node, parent);

    this.printTrailingComments(node, parent);
  }

  /**
   * Print a sequence of nodes as statements.
   */

  printJoin(nodes, parent, opts = {}) {
    if (!nodes || !nodes.length) return;

    var len = nodes.length;

    if (opts.indent) this.indent();

    var separatorIsArray = isArray(opts.separator);

    var printOpts = {
      statement: opts.statement,
      addNewlines: opts.addNewlines,
      after: () => {
        if (opts.iterator) {
          opts.iterator(node, i);
        }

        if (opts.separator && i < len - 1) {
          if (separatorIsArray) {
            this.push(...opts.separator);
          } else {
            this.push(opts.separator);
          }
        }
      }
    };

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      this.print(node, parent, printOpts);
    }

    if (opts.indent) this.dedent();
  }

  /**
   * Print a sequence of nodes as expressions.
   */

  printSequence(nodes, parent, opts = {}) {
    opts.statement = true;
    return this.printJoin(nodes, parent, opts);
  }

  /**
   * Print a list of nodes, with a customizable separator (defaults to ",").
   */

  printList(items, parent, opts = {}) {
    if (opts.separator == null) {
      opts.separator = ",";
    }

    return this.printJoin(items, parent, opts);
  }

  /**
   * Print node and indent comments.
   */

  printAndIndentOnComments(node, parent) {
    var indent = !!node.leadingComments;
    if (indent) this.indent();
    this.print(node, parent);
    if (indent) this.dedent();
  }

  /**
   * Print a block-like node.
   */

  printBlock(node, parent) {
    if (t.isEmptyStatement(node)) {
      this.semicolon();
    } else {
      this.push(" ");
      this.print(node, parent);
    }
  }

  /**
   * [Please add a description.]
   */

  generateComment(comment) {
    var val = comment.value;
    if (comment.type === "CommentLine") {
      val = `//${val}`;
    } else {
      val = `/*${val}*/`;
    }
    return val;
  }

  /**
   * [Please add a description.]
   */

  printTrailingComments(node, parent) {
    this._printComments(this.getComments("trailingComments", node, parent));
  }

  /**
   * [Please add a description.]
   */

  printInnerComments(node) {
    if (!node.innerComments) return;
    this.indent();
    this._printComments(node.innerComments);
    this.dedent();
  }

  /**
   * [Please add a description.]
   */

  printLeadingComments(node, parent) {
    this._printComments(this.getComments("leadingComments", node, parent));
  }

  printLeadingTokens(node, parent) {
    if (node.tokensBefore) {

    }
  }

  printTrailingTokens(node, parent) {
    // debugger;
  }

  /**
   * [Please add a description.]
   */

  getComments(key, node, parent) {
    if (t.isExpressionStatement(parent)) {
      return [];
    }

    var comments = [];
    var nodes    = [node];

    if (t.isExpressionStatement(node)) {
      nodes.push(node.argument);
    }

    for (let node of (nodes: Array)) {
      comments = comments.concat(this._getComments(key, node));
    }

    return comments;
  }

  /**
   * [Please add a description.]
   */

  _getComments(key, node) {
    return (node && node[key]) || [];
  }

  /**
   * [Please add a description.]
   */

  shouldPrintComment(comment) {
    return true;
  }

  /**
   * [Please add a description.]
   */

  _printComments(comments) {
    if (!comments || !comments.length) return;

    for (var comment of (comments: Array)) {
      if (!this.shouldPrintComment(comment)) continue;
      if (comment._displayed) continue;
      comment._displayed = true;

      this.catchUp(comment);

      // whitespace before
      this.newline(this.whitespace.getNewlinesBefore(comment));

      var column = this.position.column;
      var val    = this.generateComment(comment);

      if (column && !this.isLast(["\n", " ", "[", "{"])) {
        this._push(" ");
        column++;
      }

      // if (column === 0) {
      //   val = this.getIndent() + val;
      // }

      //"get "
      this._push(val);

      if (comment.type === "CommentLine") {
        this._push("\n");
      }

      // whitespace after
      this.newline(this.whitespace.getNewlinesAfter(comment));
    }
  }
}

/**
 * Mixin all buffer functions so that they can be directly called on the
 * CodeGenerator instance
 */

each(TokenBuffer.prototype, function (fn, key) {
  CodeGenerator.prototype[key] = function () {
    return fn.apply(this.buffer, arguments);
  };
});

/**
 * Mixin the generator function for each node type
 */

each(CodeGenerator.generators, function (generator) {
  extend(CodeGenerator.prototype, generator);
});

/**
 * [Please add a description.]
 */

module.exports = function (ast, opts, code) {
  var gen = new CodeGenerator(ast, opts, code);
  return gen.generate();
};

module.exports.CodeGenerator = CodeGenerator;
