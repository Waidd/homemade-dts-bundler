import { resolve } from "path";
import webpack = require("webpack");

import { IDTSOptions } from "./options";
import { Bundler } from "./bundler";

/**
 * Webpack plugin for dts bundling.
 */
export class HomemadeDTSBundlerPlugin {
	private _options: IDTSOptions;

	/**
	 * Plugin constructor.
	 * @param options Bundling options as specified in IDTSOptions.
	 */
	public constructor(options: IDTSOptions) {
		this._options = {
			entry: resolve(options.entry),
			output: resolve(options.output),
			libraryName: options.libraryName,
			indent: options.indent || "\t",
		};
	}

	/**
	 * Webpack entry point.
	 * @param compiler webpack compiler.
	 */
	public apply(compiler: webpack.Compiler) {
		compiler.hooks.done.tapPromise("homemadeDTSBundler", () => Bundler.bundle(this._options));
	}
}
