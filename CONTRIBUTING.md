
**[Setup](#setup) | [Running Tests](#running-tests) | [Internals](#internals)**

----

# Contributing

Contributions are always welcome, no matter how large or small. Before
contributing, please read the
[code of conduct](https://github.com/babel/babel/blob/master/CODE_OF_CONDUCT.md).

## Developing

#### Setup

```sh
$ git clone https://github.com/babel/babel
$ cd babel
$ make bootstrap
```

Then you can either run:

```sh
$ make build
```

to build Babel **once** or:

```sh
$ make watch
```

to have Babel build itself then incrementally build files on change.

If you wish to build a copy of Babel for distribution then run:

```sh
$ make build-dist
```

and access the files from `packages/babel/dist`.

#### Running tests

You can run tests for all packages via:

```sh
$ make test
```

This is mostly overkill and you can limit the package to a select by using the `TEST_ONLY` environment variable:

```sh
$ TEST_ONLY=babel-cli make test
```

Use the `TEST_GREP` variable to run a subset of tests by name:

```sh
$ TEST_GREP=transformation make test
```

To test the code coverage, use:

```sh
$ make test-cov
```

#### Internals

Please see [`/doc`](/doc) for internals documentation relevant to developing babel.
