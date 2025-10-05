import cron from 'node-cron';
import { ParserManager } from '../src/services/ParserManager';
import { FileService } from '../src/services/FileService';
import { config } from '../src/utils/config';

const parserManager = new ParserManager();
const fileService = new FileService();

async function scheduledParse(): Promise<void> {
  console.log('=== STARTING SCHEDULED PARSING ===', new Date().toISOString());
  
  try {
    await parserManager.parseAllSources(true);
    console.log('Scheduled parsing completed successfully');
  } catch (error) {
    console.error('Error in scheduled parsing:', error);
  }
  
  console.log('=== SCHEDULED PARSING COMPLETED ===\n');
}

async function cleanupTask(): Promise<void> {
  console.log('Running cleanup task...', new Date().toISOString());
  
  try {
    await fileService.cleanupOldFiles();
    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Error in cleanup task:', error);
  }
}

// Запуск задач по расписанию
console.log('Starting cron jobs...');

// Парсинг каждые 2 часа
cron.schedule(config.cron.newsUpdate, scheduledParse);

// Очистка каждый день в полночь
cron.schedule(config.cron.cleanup, cleanupTask);

// Запускаем сразу при старте
scheduledParse();

// Оставляем процесс активным
process.on('SIGINT', () => {
  console.log('Shutting down cron jobs...');
  process.exit(0);
});