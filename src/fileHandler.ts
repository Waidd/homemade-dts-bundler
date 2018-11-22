import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);

import { IDTSOptions } from "./options";

/**
 * Declaration object.
 */
export interface IDeclarationObject {
	/**
	 * Absolute path of the .d.ts.
	 */
	absoluteFilePath: string;
	/**
	 * Path of the .d.ts in the module scope :
	 * relative to the entry point & without .d.ts.
	 */
	moduleFilePath: string;
	/**
	 * Content of the file with relative imports made absolute.
	 */
	content: string;
	/**
	 * List of relative imports in the file.
	 */
	imports: string[];
}

/**
 * Parse .d.ts file, return & resolve relative imports,
 * wrap the file in a module declaration.
 */
export class FileHandler {
	private _options: IDTSOptions;

	/**
	 * FileHandler constructor.
	 * @param options Bundling options as specified in IDTSOptions
	 */
	public constructor(options: IDTSOptions) {
		this._options = options;
	}

	/**
	 * Parse a .d.ts file, resolve the relative imports, wrap the content
	 * in a module declaration.
	 * @param absoluteFilePath absolute path of the .d.ts
	 * @returns an IDeclarationObject
	 */
	public async handleFile(absoluteFilePath: string): Promise<IDeclarationObject> {
		const basePath = path.dirname(this._options.entry);
		const declarationFile = {
			absoluteFilePath,
			moduleFilePath: absoluteFilePath.replace(basePath, "").replace(".d.ts", ""),
			content: (await readFile(absoluteFilePath)).toString(),
			imports: [],
		} as IDeclarationObject;

		await this._resolveRelativeImports(declarationFile);

		let moduleName = this._options.libraryName;
		// to avoid /index on the entry point
		if (absoluteFilePath !== this._options.entry) {
			// replace \ with / if used on windows environment
			moduleName += declarationFile.moduleFilePath.replace(/\\/g, "/");
		}

		// trim declare keyword
		declarationFile.content = declarationFile.content.replace(/declare /g, "");

		// add indentation for declare module wrapping
		const indent = this._options.indent || "\t";
		const content = declarationFile.content.split("\n").map((each) => each !== "" ? `${indent}${each}` : "").join("\n");

		// declare module wrapping
		declarationFile.content = `declare module "${moduleName}" {\n${content}}\n`;

		return declarationFile;
	}

	/**
	 * Check if the specifiedPath goes to a file or a directory.
	 * @param filePath file to check.
	 * @param absoluteFilePath absolute path of the file to check.
	 * @returns filePath if it is a file, filePath/index is it is a directory.
	 */
	private async _findFile(filePath: string, absoluteFilePath: string): Promise<string> {
		const dirname = path.dirname(absoluteFilePath);

		try {
			const straitPath = path.resolve(dirname, `${filePath}.d.ts`);
			await stat(straitPath);
			return filePath;
		} catch (up) {
			if (up.code !== "ENOENT") { throw up; }
		}

		try {
			const indexPath = path.resolve(dirname, filePath, "index.d.ts");
			await stat(indexPath);
			return path.join(filePath, "index");
		} catch (up) {
			if (up.code !== "ENOENT") { throw up; }
		}

		return null;
	}

	/**
	 * Go through all the import/exports and resolve relative ones.
	 * @param declarationFile IDeclarationObject to handle.
	 * @returns a promise resolved when the job is done.
	 */
	private async _resolveRelativeImports(declarationFile: IDeclarationObject): Promise<void> {
		const fileDirname = path.dirname(declarationFile.moduleFilePath);

		// any sentence start with from or import followed by a double quote path start with a dot
		const regex = /(from|import) "(\.[a-zA-Z0-9\/\.\-]*)";/g;

		let rawImport;
		// tslint:disable-next-line:no-conditional-assignment
		while ((rawImport = regex.exec(declarationFile.content)) !== null) {
			if (this._isInStringOrComment(declarationFile.content, rawImport.index)) { continue; }

			const [importSentence, , importPath] = rawImport;

			// check if path is a path.d.ts, a path/index.d.ts or something else
			const completeImportPath = await this._findFile(importPath, declarationFile.absoluteFilePath);
			if (completeImportPath === null) { continue; }

			// push the relative path to parse later
			declarationFile.imports.push(path.resolve(path.dirname(declarationFile.absoluteFilePath), `${completeImportPath}.d.ts`));

			// resolve the relative import
			const fixedImportPath = this._options.libraryName + path.join(fileDirname, completeImportPath).replace(/\\/g, "/");
			const fixedImportSentence = importSentence.replace(importPath, fixedImportPath);

			// replace the relative import
			declarationFile.content =
				declarationFile.content.slice(0, rawImport.index) +
				fixedImportSentence +
				declarationFile.content.slice(rawImport.index + importSentence.length);
		}
	}

	/**
	 * Check if the targetted index is in a comment or a string
	 * @param str
	 * @param targetIndex
	 * @returns
	 */
	private _isInStringOrComment(str: string, targetIndex: number): boolean {
		let isLongComment = false;
		let isShortComment = false;
		let isSimpleQuoteString = false;
		let isDoubleQuoteString = false;
		let isBackQuoteString = false;

		for (let index = 0; index < targetIndex; index++) {
			const c = str[index];

			if (isSimpleQuoteString || isDoubleQuoteString || isBackQuoteString) {
				if (isDoubleQuoteString && c === `"`) { isDoubleQuoteString = false; continue; }
				if (isSimpleQuoteString && c === "'") { isSimpleQuoteString = false; continue; }
				if (isBackQuoteString && c === "`") { isBackQuoteString = false; continue; }
				continue;
			}

			if (isShortComment || isLongComment) {
				if (isShortComment && c === "\n") { isShortComment = false; continue; }
				if (isLongComment && c === "*" && index + 1 < targetIndex && str[index + 1] === "/") { isLongComment = false; continue; }
				continue;
			}

			switch (c) {
				case "/": {
					if (index - 1 > 0 && str[index - 1] === "*") { break; }
					if (index + 1 >= targetIndex) { break; }
					if (str[index + 1] === "/") { isShortComment = true; break; }
					if (str[index + 1] === "*") { isLongComment = true; break; }
					break;
				}
				case `"`: { isDoubleQuoteString = true; break; }
				case "'": { isSimpleQuoteString = true; break; }
				case "`": { isBackQuoteString = true; break; }
			}
		}

		return isShortComment || isLongComment || isSimpleQuoteString || isDoubleQuoteString || isBackQuoteString;
	}
}
