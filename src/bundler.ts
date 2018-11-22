import { promisify } from "util";
import * as fs from "fs";
const writeFile = promisify(fs.writeFile);

import { IDTSOptions } from "./options";
import { TreeExplorer } from "./treeExplorer";

/**
 * Bundle declaration files from tsc output to a single file using the options.
 */
export class Bundler {
	/**
	 * This function handle the whole process.
	 * @param options Bundling options as specified in IDTSOptions.
	 * @returns a promise resolved when the file is writed.
	 */
	public static async bundle(options: IDTSOptions): Promise<void> {
		const bundler = new Bundler(options);
		await bundler.bundle();
	}

	private _options: IDTSOptions;
	private _treeExplorer: TreeExplorer;

	/**
	 * Bundle constructor.
	 * @param options Bundling options as specified in IDTSOptions.
	 */
	public constructor(options: IDTSOptions) {
		this._options = options;
		this._treeExplorer = new TreeExplorer(options);
	}

	/**
	 * Call TreeExplorer to parse/handle .d.ts files and ouput the result in a single file.
	 * @returns a promise resolved when the file is writed.
	 */
	public async bundle(): Promise<void> {
		const files = await this._treeExplorer.explore();
		const content = files.map((file) => file.content).join("\n");
		await writeFile(this._options.output, content);
	}
}
