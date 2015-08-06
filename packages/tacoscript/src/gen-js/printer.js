
/**
 * Print a plain node.
 */

export function printPlain(node, parent, opts) {
  return this.generator.print(node, this.parent, opts);
}

/**
 * Print a sequence of nodes as statements.
 */

export function printSequence(nodes, parent, opts = {}) {
  opts.statement = true;
  return this.printJoin(nodes, parent, opts);
}

// /**
//  * Print a sequence of nodes as expressions.
//  */

// export function printJoin(nodes, parent, opts) {
//   return this.generator.printJoin(this, nodes, opts);
// }

/**
 * Print a list of nodes, with a customizable separator (defaults to ",").
 */

export function printList(items, parent, opts = {}) {
  if (opts.separator == null) {
    opts.separator = ",";
    if (!this.generator.format.compact) opts.separator += " ";
  }

  return this.join(items, opts);
}

// /**
//  * Print a block-like node.
//  */

// export function printBlock(node, parent) {
//   return this.generator.printBlock(this, node);
// }

/**
 * Print node and indent comments.
 */

export function printIndentOnComments(node, parent) {
  return this.generator.printAndIndentOnComments(this, node);
}

