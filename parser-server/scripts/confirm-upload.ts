import { FileService } from '../src/services/FileService';
import { DatabaseService } from '../src/services/DatabaseService';
import readline from 'readline';

const fileService = new FileService();
const dbService = new DatabaseService();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function formatDate(date: any): string {
  try {
    // If it's already a Date object
    if (date instanceof Date) {
      return date.toISOString();
    }
    
    // If it's a string that can be converted to Date
    if (typeof date === 'string') {
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toISOString();
      }
    }
    
    // If it's a timestamp (number)
    if (typeof date === 'number') {
      const dateObj = new Date(date);
      return dateObj.toISOString();
    }
    
    // Fallback: return raw value or current date
    return String(date || new Date().toISOString());
  } catch (error) {
    return new Date().toISOString(); // Fallback to current date
  }
}

async function confirmUpload() {
  console.log('=== NEWS UPLOAD CONFIRMATION ===\n');
  
  const tempFiles = await fileService.getTempFiles();
  
  if (tempFiles.length === 0) {
    console.log('No temporary files found for upload.');
    rl.close();
    return;
  }
  
  console.log('Available files:');
  tempFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file.source} - ${file.items.length} items (${formatDate(file.parsedAt)})`);
  });
  
  const answer = await question('\nSelect file to upload (number) or "all" for all files: ');
  
  let filesToProcess: typeof tempFiles = [];
  
  if (answer.toLowerCase() === 'all') {
    filesToProcess = tempFiles;
  } else {
    const fileIndex = parseInt(answer) - 1;
    if (fileIndex >= 0 && fileIndex < tempFiles.length) {
      filesToProcess = [tempFiles[fileIndex]];
    } else {
      console.log('Invalid selection.');
      rl.close();
      return;
    }
  }
  
  console.log(`\nSelected ${filesToProcess.length} file(s) for processing.`);
  
  for (const file of filesToProcess) {
    console.log(`\n--- Processing ${file.source} ---`);
    console.log(`Items: ${file.items.length}`);
    console.log(`Parsed at: ${formatDate(file.parsedAt)}`);
    
    const confirm = await question('Upload to database? (y/n): ');
    
    if (confirm.toLowerCase() === 'y') {
      console.log('Uploading...');
      
      const result = await dbService.createNews(file.items);
      
      if (result.errors.length > 0) {
        console.log(`Upload completed with ${result.errors.length} errors:`);
        result.errors.forEach(error => console.log(`  - ${error}`));
      } else {
        console.log(`✓ Successfully uploaded ${result.success} items`);
      }
      
      // Архивируем файл после успешной загрузки
      await fileService.archiveFile(file.filePath);
      console.log('File archived.');
    } else {
      console.log('Upload cancelled.');
      
      const deleteFile = await question('Delete temporary file? (y/n): ');
      if (deleteFile.toLowerCase() === 'y') {
        await fileService.deleteFile(file.filePath);
        console.log('File deleted.');
      }
    }
  }
  
  rl.close();
  console.log('\n=== UPLOAD PROCESS COMPLETED ===');
}

confirmUpload().catch(error => {
  console.error('Upload confirmation failed:', error);
  rl.close();
  process.exit(1);
});