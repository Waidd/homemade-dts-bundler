import { resolve } from "path";
import * as webpack from "webpack";

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
		compiler.hooks.emit.tapPromise("homemadeDTSBundler", async (compilation: webpack.compilation.Compilation) => {
			try {
				await Bundler.bundleWithWebpack(this._options, compilation);
			} catch (e) {
				compilation.errors.push(new Error(`homemade-dts-bundler:\n\t${e.message}`));
			}
		});
	}
}
