/**
 * Print File.program
 */

export function File(node, print) {
  print.plain(node.program);
}

/**
 * Print all nodes in a Program.body.
 */

export function Program(node, print) {
  print.sequence(node.body);
}

function isBlockStarter(node) {
  // console.log(node);
  return false;
}

/**
 * Print BlockStatement, collapses empty blocks, prints body.
 */

export function BlockStatement(node, print) {
  // this.push("{");
  if (!isBlockStarter(node.parent)) {
    this.push("do ");
  }
  if (node.body.length) {
    // this.newline();
    print.sequence(node.body, { indent: true });
    // this.rightBrace();
  } else {
    this.push("donothing");
    print.printInnerComments();
  }
}

/**
 * What is my purpose?
 * Why am I here?
 * Why are any of us here?
 * Does any of this really matter?
 */

export function Noop() {

}
