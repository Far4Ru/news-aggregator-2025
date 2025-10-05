import fs from 'fs/promises';
import path from 'path';
import { NewsItem, TempNewsFile } from '../types';
import { Helpers } from '../utils/helpers';
import { config } from '../utils/config';

export class FileService {
  private tempDir: string;
  private archiveDir: string;

  constructor() {
    this.tempDir = config.files.tempDir;
    this.archiveDir = config.files.archiveDir;
    this.initDirs();
  }

  private async initDirs(): Promise<void> {
    await fs.mkdir(this.tempDir, { recursive: true });
    await fs.mkdir(this.archiveDir, { recursive: true });
  }

  async saveToTempFile(sourceName: string, items: NewsItem[]): Promise<string> {
    const timestamp = Helpers.formatDate(new Date());
    const filename = `news_${sourceName}_${timestamp}.json`;
    const filePath = path.join(this.tempDir, filename);

    const tempFile: TempNewsFile = {
      filename,
      source: sourceName,
      items,
      parsedAt: new Date(),
      filePath
    };

    await fs.writeFile(filePath, JSON.stringify(tempFile, null, 2), 'utf-8');
    console.log(`Saved ${items.length} items to ${filename}`);
    
    return filePath;
  }

  async readTempFile(filePath: string): Promise<TempNewsFile | null> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading temp file ${filePath}:`, error);
      return null;
    }
  }

  async getTempFiles(): Promise<TempNewsFile[]> {
    try {
      const files = await fs.readdir(this.tempDir);
      const tempFiles: TempNewsFile[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.tempDir, file);
          const tempFile = await this.readTempFile(filePath);
          if (tempFile) {
            tempFiles.push(tempFile);
          }
        }
      }

      return tempFiles.sort((a, b) => 
        new Date(b.parsedAt).getTime() - new Date(a.parsedAt).getTime()
      );
    } catch (error) {
      console.error('Error reading temp files:', error);
      return [];
    }
  }

  async archiveFile(filePath: string): Promise<void> {
    try {
      const filename = path.basename(filePath);
      const archivePath = path.join(this.archiveDir, filename);
      await fs.rename(filePath, archivePath);
      console.log(`Archived file: ${filename}`);
    } catch (error) {
      console.error(`Error archiving file ${filePath}:`, error);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      console.log(`Deleted file: ${path.basename(filePath)}`);
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }

  async cleanupOldFiles(): Promise<void> {
    try {
      const files = await fs.readdir(this.tempDir);
      const now = new Date().getTime();
      const maxAge = config.files.keepTempFiles * 60 * 60 * 1000; // в миллисекундах

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await this.deleteFile(filePath);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old files:', error);
    }
  }
}