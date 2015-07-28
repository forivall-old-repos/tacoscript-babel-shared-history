// TODO: separate out the comment token creation

import {Token} from "babylon/lib/tokenize";

import traverse from 'babel-core/lib/traversal';
import * as types from 'babel-core/lib/types';
import {flatten, compact} from 'lodash';

export default function attachTokens(ast, code, options={}) {
  var tokens = ast.tokens;
  if (options.whitespace) {
    tokens = ast.whitespaceTokens = createWhitespaceTokens(ast, code);
  }
  // traverse ast; attach tokens accordingly; make sure it's performed with performance in mind
  var i = 0, cur = tokens[i];
  function next() { return tokens[i += 1]; }
  var stack = [];
  function pushToken(tok) {
    for (var i = 0, l = stack.length; i < l; i++) {
      stack[i].tokens.push(tok);
    }
  }
  traverse(ast, {
    noScope: true,
    enter: function(node, parent, scope, nodes) {
      for (; cur.start < node.start; cur = next()) {
        pushToken(cur);
      }
      node.tokens = [];
      stack.push(node);
      // console.log(node.start, stack.length);

      let visitors = types.VISITOR_KEYS[node.type];
      let childNodes = compact(flatten(visitors.map((v) => node[v])));
      node.children = childNodes;
    },
    exit: function(node) {
      for (; cur && cur.end <= node.end; cur = next()) {
        pushToken(cur);
      }
      /*var popped = */stack.pop();
      // assert(popped === node);
      // console.log(node.end, stack.length, popped === node);

      let childNodes = node.children;
      if (!childNodes) { return; }
      for (let childNode, childNodeBefore, childNodeAfter, i = 0, l = childNodes.length;
      (childNode = childNodes[i], childNodeBefore = childNodes[i - 1], childNodeAfter = childNodes[i + 1], i < l); i++) {
        // TODO: optimise, apply rules to decide which node owns which tokens
        childNode.tokensBefore = [];
        childNode.tokensAfter = [];
        for (let token of (node.tokens: Array)) {
          if ((!childNodeBefore || token.start >= childNodeBefore.end) && token.end <= childNode.start) {
            childNode.tokensBefore.push(token);
          } else if (token.start >= childNode.end && (!childNodeAfter || token.end <= childNodeAfter.start)) {
            childNode.tokensAfter.push(token);
          }
        }
      }
    }
  });
  return ast;
}

export function createWhitespaceTokens(ast, code) {
  var tokens = [];
  var state = {
    type: 'Whitespace',
    value: '',
    start: 0,
    end: 0,
    // TODO: read from options; generate locations
    options: {locations: false, ranges: true}
  };
  var cur, prev = {end: 0};
  for (var i = 0, l = ast.tokens.length; i <= l; i++) {
    cur = ast.tokens[i] || {start: l};
    if (cur.start > prev.end) {
      state.start = prev.end;
      state.end = cur.start;
      state.value = code.slice(state.start, state.end);
      tokens.push(new Token(state));
    }
    tokens.push(cur);
    prev = cur;
  }
  tokens.pop(); // pop off dummy last token
  return tokens;
}
