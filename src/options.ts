
/**
 * Bundling options
 */
export interface IDTSOptions {
	/**
	 * The absolute path to the index.d.ts writed by the compilator
	 */
	entry: string;
	/**
	 * The absolute path to the desired output file
	 */
	output: string;
	/**
	 * The library name as in the package.json
	 */
	libraryName: string;
	/**
	 * Selected indentation for the output (\n or \t)
	 */
	indent?: string;
}
