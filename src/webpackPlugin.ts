import { resolve } from "path";
import * as webpack from "webpack";

import { IDTSOptions } from "./options";
import { Bundler } from "./bundler";

/**
 * Webpack plugin for dts bundling.
 */
export class HomemadeDTSBundlerPlugin {
	private _options: IDTSOptions;
	private _allAssets: { [path: string]: any } = {};

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
				/**
				 * Keeping assets for normal functionning in watch mode.
				 * (In watch mode, after the first run, only modified assets are available in compilation.assets,
				 * so we need to keep all the previous assets in order to write a complete dts bundle.)
				 */
				Object.assign(this._allAssets, compilation.assets);

				await Bundler.bundleWithWebpack(this._options, {
					assetsRef: compilation.assets,
					allAssets: this._allAssets,
					outputPath: compilation.compiler.options.output.path,
				});
			} catch (e) {
				compilation.errors.push(new Error(`homemade-dts-bundler:\n\t${e.message}`));
			}
		});
	}
}
