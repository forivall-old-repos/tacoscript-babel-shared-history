export default {
  //- builtin-prepass

  //- builtin-pre
  _validation:                             require("./internal/validation"),

  //- builtin-basic
  // this is where the bulk of the ES6 transformations take place, none of them require traversal state
  // so they can all be concatenated together for performance

  //- builtin-advanced
  // jadeToReact:                                   require("./other/jadeToReact"),
  // react:                                   require("./other/react"),

  //- builtin-trailing
  // these clean up the output and do finishing up transformations, it's important to note that by this
  // stage you can't import any new modules or insert new ES6 as all those transformers have already
  // been ran
};
