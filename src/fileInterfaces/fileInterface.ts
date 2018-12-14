/**
 * Interface to read & write files.
 */
export abstract class AFileInterface {
	/**
	 * Read file & returns content.
	 * @param absolutePath absolute path of the file.
	 * @returns content of the file.
	 */
	public abstract async readFile(absolutePath: string): Promise<string>;

	/**
	 * Check if file exists.
	 * @param absolutePath absolute path of the file.
	 * @returns true if it exists nor false.
	 */
	public abstract async exists(absolutePath: string): Promise<boolean>;

	/**
	 * Write file.
	 * @param absolutePath absolute path of the file.
	 * @param content content to write in the file.
	 * @returns a promise resolved when the file is writed.
	 */
	public abstract async writeFile(absolutePath: string, content: string): Promise<void>;
}
