import * as webpack from "webpack";
import { resolve } from "path";

import { AFileInterface } from "./fileInterface";

/**
 * Interface to read & write files throught webpack compilation.
 */
export class FileInterfaceWebpack extends AFileInterface {
	private _compilation: webpack.compilation.Compilation;

	/**
	 * Constructor of the interface.
	 * @param compilation webpack compilation to read/write from.
	 */
	public constructor(compilation: webpack.compilation.Compilation) {
		super();
		this._compilation = compilation;
	}

	/**
	 * Read file in the assets of the webpack compilation.
	 * @param absolutePath absolute path of the file.
	 * @returns content of the file.
	 */
	public async readFile(absolutePath: string): Promise<string> {
		const relativePath = this._getRelativePath(absolutePath);
		return this._compilation.assets[relativePath].source();
	}

	/**
	 * Check if file exists in the assets of the webpack compilation.
	 * @param absolutePath absolute path of the file.
	 * @returns true if it exists nor false.
	 */
	public async exists(absolutePath: string): Promise<boolean> {
		const relativePath = this._getRelativePath(absolutePath);

		return this._compilation.assets[relativePath] !== undefined;
	}

	/**
	 * Write file in an asset of the webpack compilation.
	 * @param absolutePath absolute path of the file.
	 * @param content content to write in the file.
	 * @returns a promise resolved when the file is added to the compilation assets.
	 */
	public async writeFile(absolutePath: string, content: string): Promise<void> {
		const relativePath = this._getRelativePath(absolutePath);

		this._compilation.assets[relativePath] = {
			source: () => new Buffer(content),
			size: () => Buffer.byteLength(content),
		};
	}

	private _getRelativePath(absolutePath: string): string {
		const basePath = resolve(this._compilation.compiler.options.output.path);
		// remove basePath & heading / or \
		return absolutePath.replace(basePath, "").slice(1);
	}
}
