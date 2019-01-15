import { IDTSOptions } from "./options";
import { TreeExplorer } from "./treeExplorer";
import { AFileInterface, FileInterfaceFilesystem, FileInterfaceWebpack, IWebpackAssets } from "./fileInterfaces";

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
		const bundler = new Bundler(options, new FileInterfaceFilesystem());
		await bundler.bundle();
	}

	/**
	 * This function handle the whole process throught a webpack compilation.
	 * @param options Bundling options as specified in IDTSOptions.
	 * @param compilation Webpack compilation.
	 * @returns a promise resolved when the file is writed in the compilation assets.
	 */
	public static async bundleWithWebpack(options: IDTSOptions, webpackAssets: IWebpackAssets) {
		const bundler = new Bundler(options, new FileInterfaceWebpack(webpackAssets));
		await bundler.bundle();
	}

	private _options: IDTSOptions;
	private _fileInterface: AFileInterface;
	private _treeExplorer: TreeExplorer;

	/**
	 * Bundle constructor.
	 * @param options Bundling options as specified in IDTSOptions.
	 * @param fileInterface fileInterface to handle file I/O.
	 */
	public constructor(options: IDTSOptions, fileInterface: AFileInterface) {
		this._options = options;
		this._fileInterface = fileInterface;
		this._treeExplorer = new TreeExplorer(options, fileInterface);
	}

	/**
	 * Call TreeExplorer to parse/handle .d.ts files and ouput the result in a single file.
	 * @returns a promise resolved when the file is writed.
	 */
	public async bundle(): Promise<void> {
		const files = await this._treeExplorer.explore();
		const content = files.map((file) => file.content).join("\n");
		await this._fileInterface.writeFile(this._options.output, content);
	}
}
