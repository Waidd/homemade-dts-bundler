import * as fs from "fs";
import { promisify } from "util";
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

import { AFileInterface } from "./fileInterface";

/**
 * Interface to read & write files throught the filesystem.
 */
export class FileInterfaceFilesystem extends AFileInterface {
	/**
	 * Read file from the filesystem & returns content.
	 * @param absolutePath absolute path of the file.
	 * @returns content of the file.
	 */
	public async readFile(absolutePath: string): Promise<string> {
		return (await readFile(absolutePath)).toString();
	}

	/**
	 * Check if file exists on the filesystem.
	 * @param absolutePath asbolute path of the file.
	 * @returns true if it exists nor false.
	 */
	public async exists(absolutePath: string): Promise<boolean> {
		try {
			await stat(absolutePath);
			return true;
		} catch (up) {
			if (up.code !== "ENOENT") { throw up; }
		}
		return false;
	}

	/**
	 * Write file to the filesystem.
	 * @param absolutePath absolute path of the file.
	 * @param content content to write in the file.
	 * @returns a promise resolved when the file is writed.
	 */
	public async writeFile(absolutePath: string, content: string): Promise<void> {
		await writeFile(absolutePath, content);
	}
}
