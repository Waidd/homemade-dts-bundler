import { IDTSOptions } from "./options";
import { FileHandler, IDeclarationObject } from "./fileHandler";

type DeclarationTree = Promise<IDeclarationObject[]>;

/**
 * Goes through the .d.ts tree and handle each file.
 */
export class TreeExplorer {
	private _options: IDTSOptions;
	private _fileHandler: FileHandler;

	/**
	 * TreeExplorer constructor.
	 * @param options Bundling options as specified in IDTSOptions
	 */
	public constructor(options: IDTSOptions) {
		this._options = options;
		this._fileHandler = new FileHandler(options);
	}

	/**
	 * Go through the .d.ts. Start with the entry specified in the options.
	 * @returns a promise resolved when the whole tree is parsed with as content an array of IDeclarationObject.
	 */
	public explore(): DeclarationTree {
		return this._explore(this._options.entry, [this._options.entry]);
	}

	/**
	 * Recursive function. For each file, will use FileHandle to handle file and get relative imports.
	 * @param entry file to parse/handle
	 * @param map list of files already parsed/handled
	 * @returns a promise resolved when the tree subsequent to entry is parsed with as content an array of IDeclarationObject.
	 */
	private async _explore(entry: string, map: string[]): DeclarationTree {
		const declarationFile = await this._fileHandler.handleFile(entry);

		// async reduce on the relative imports found in the entry file
		const subDeclarationsFiles = await declarationFile.imports.reduce(async (p: DeclarationTree, fileAbsolutePath: string): DeclarationTree => {
			const previousFiles = await p;

			// if the file is in the map, it has already been handled
			if (map.includes(fileAbsolutePath)) { return previousFiles; }
			map.push(fileAbsolutePath);

			// return in an array the result of all the handleFile call.
			return [...previousFiles, ...(await this._explore(fileAbsolutePath, map))];
		}, Promise.resolve(new Array<IDeclarationObject>()));

		return [declarationFile, ...subDeclarationsFiles];
	}
}
