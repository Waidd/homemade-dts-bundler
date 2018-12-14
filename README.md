# Homemade DTS bundler

As [dts-bundle](https://github.com/TypeStrong/dts-bundle), this module bundles .d.ts files with a simple approach. It is not fully tested and may not work in your project.

In this approach, each .d.ts file is wrapped in a declare module statement, relative imports are resolved through this module scope and augmentations (declaration merging) should be preserved.

See a sample output in /dist/index.d.ts of a release.

## Usage

Install it (you can also use a global install):

```bash
npm install homemade-dts-bundle
```

Compile your typescript project with `--declaration` option.

Run homemade-dts-bundle:

```bash
./bin/homemade-dts-bundler --entry .declaration/index.d.ts --output index.d.ts --libraryName my-lib
```

See the options:

```bash
./bin/homemade-dts-bundler -h
```

## Usage with webpack

The module come with a webpack plugin.
In this case, files will be readed/writed through the webpack compilation assets.

```javascript
const { HomemadeDTSBundlerPlugin } = require("homemade-dts-bundler");

module.exports = {
  entry: "src/index.ts",
  output: {
    filename: "mylib.js",
    path: "dist",
    library: "mylib",
    libraryTarget: "commonjs2",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [new HomemadeDTSBundlerPlugin({
    entry: "dist/.declaration/index.d.ts",
    output: "dist/index.d.ts",
    libraryName: "mylib",
  })],
};
```

## Usage programmatic

.d.ts is provided with comments for programmatic usage.
