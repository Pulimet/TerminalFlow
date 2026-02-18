import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import * as path from 'path';

/**
 * A generic class for managing JSON file storage.
 * @template T The type of data stored.
 */
export class Store<T> {
    private filePath: string;
    private defaultValue: T;

    /**
     * Creates an instance of Store.
     * @param dirPath The directory path where the file is located.
     * @param fileName The name of the file.
     * @param initialData The default data to initialize the file with if it doesn't exist.
     */
    constructor(private dirPath: string, private fileName: string, initialData: T) {
        this.filePath = path.join(dirPath, fileName);
        this.defaultValue = initialData;
        this.ensureFile(initialData);
    }

    /**
     * Ensures that the storage file and directory exist.
     * @param initialData The data to write if the file needs to be created.
     */
    private ensureFile(initialData: T) {
        if (!existsSync(this.dirPath)) {
            mkdirSync(this.dirPath, { recursive: true });
        }
        if (!existsSync(this.filePath)) {
            writeFileSync(this.filePath, JSON.stringify(initialData, null, 2));
        }
    }

    /**
     * Reads data from the storage file.
     * @returns A promise that resolves to the stored data.
     */
    public async read(): Promise<T> {
        try {
            if (existsSync(this.filePath)) {
                const content = await fs.readFile(this.filePath, 'utf8');
                if (!content.trim()) return this.defaultValue;
                return JSON.parse(content) as T;
            }
        } catch (error) {
            console.error(`Error reading ${this.fileName}:`, error);
            vscode.window.showErrorMessage(`Failed to read ${this.fileName} configuration.`);
        }
        return this.defaultValue;
    }

    /**
     * Writes data to the storage file.
     * @param data The data to write.
     * @returns A promise that resolves when writing is complete.
     */
    public async write(data: T): Promise<void> {
        try {
            await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(`Error writing ${this.fileName}:`, error);
            vscode.window.showErrorMessage(`Failed to save ${this.fileName}.`);
        }
    }

    /**
     * Gets the directory path of the store.
     * @returns The directory path.
     */
    public getPath(): string {
        return this.dirPath;
    }
}
