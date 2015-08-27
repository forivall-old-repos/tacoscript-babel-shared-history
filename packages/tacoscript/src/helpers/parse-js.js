import * as babylon from "babylon";
import attachTokens from "./attach-tokens";

/**
 * Parse `code` with normalized options, collecting tokens and comments.
 */

export default function (code, opts = {}) {
  var parseOpts = {
    allowImportExportEverywhere: opts.looseModules,
    allowReturnOutsideFunction:  opts.looseModules,
    allowHashBang:               true,
    ecmaVersion:                 6,
    strictMode:                  opts.strictMode,
    sourceType:                  opts.sourceType,
    locations:                   true,
    features:                    opts.features || {},
    plugins:                     opts.plugins || {},
    ranges:                      true
  };

  if (opts.nonStandard) {
    parseOpts.plugins.jsx = true;
    parseOpts.plugins.flow = true;
  }
  // {
  //   range: true,
  //   sourceType: 'module',
  //   allowImportExportEverywhere: true,
  //   allowReturnOutsideFunction:  true,
  //   allowHashBang:               true,
  //   ecmaVersion:                 7,
  //   strictMode:                  false,
  //   locations:                   true,
  //   ranges:                      true,
  //   features: {
  //     "es7.decorators": true,
  //     "es7.comprehensions": true,
  //     "es7.asyncFunctions": true,
  //     "es7.exportExtensions": true,
  //     "es7.functionBind": true
  //   },
  //   plugins: { jsx: true, flow: true }
  // }
  return attachTokens(babylon.parse(code, parseOpts), code, {whitespace: true});
}
