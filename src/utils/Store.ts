import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import * as path from 'path';

export class Store<T> {
    private filePath: string;
    private defaultValue: T;

    constructor(private dirPath: string, private fileName: string, initialData: T) {
        this.filePath = path.join(dirPath, fileName);
        this.defaultValue = initialData;
        this.ensureFile(initialData);
    }

    private ensureFile(initialData: T) {
        if (!existsSync(this.dirPath)) {
            mkdirSync(this.dirPath, { recursive: true });
        }
        if (!existsSync(this.filePath)) {
            writeFileSync(this.filePath, JSON.stringify(initialData, null, 2));
        }
    }

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

    public async write(data: T): Promise<void> {
        try {
            await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(`Error writing ${this.fileName}:`, error);
            vscode.window.showErrorMessage(`Failed to save ${this.fileName}.`);
        }
    }

    public getPath(): string {
        return this.dirPath;
    }
}
