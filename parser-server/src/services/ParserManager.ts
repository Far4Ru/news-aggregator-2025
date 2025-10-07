import { DatabaseService } from './DatabaseService';
import { FileService } from './FileService';
import { TelegramParser } from '../parsers/telegram/TelegramParser';
import { RSSParser } from '../parsers/rss/RSSParser';
import { Source, ParseResult } from '../types';
import { config } from '../utils/config';
import { Helpers } from '../utils/helpers';


export class ParserManager {
  private dbService: DatabaseService;
  private fileService: FileService;

  constructor() {
    this.dbService = new DatabaseService();
    this.fileService = new FileService();
  }

  async parseAllSources(saveToFile: boolean = true): Promise<ParseResult[]> {
    const sources = await this.dbService.getSources();
    const results: ParseResult[] = [];

    console.log(`Starting parsing for ${sources.length} sources...`);

    for (const source of sources) {
      try {
        console.log(`Parsing source: ${source.name} (${source.type})`);
        
        const result = await this.parseSource(source);
        results.push(result);

        if (result.success && result.data && result.data.length > 0 && saveToFile) {
          await this.fileService.saveToTempFile(source.name, result.data);
        }

        // Задержка между источниками
        await Helpers.sleep(2000);
      } catch (error) {
        console.error(`Error parsing source ${source.name}:`, error);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          sourceName: source.name,
          timestamp: new Date()
        });
      }
    }

    this.printSummary(results);
    return results;
  }

  async parseSingleSource(sourceId: string, saveToFile: boolean = true): Promise<ParseResult> {
    const sources = await this.dbService.getSources();
    const source = sources.find(s => s.id === sourceId);

    if (!source) {
      return {
        success: false,
        error: `Source with id ${sourceId} not found`,
        sourceName: 'unknown',
        timestamp: new Date()
      };
    }

    const result = await this.parseSource(source);
    
    if (result.success && result.data && result.data.length > 0 && saveToFile) {
      await this.fileService.saveToTempFile(source.name, result.data);
    }

    return result;
  }

  private async parseSource(source: Source): Promise<ParseResult> {
    try {
      let parser;

      switch (source.type) {
        case 'telegram':
          parser = new TelegramParser(source.id!, source.url, config.parsers.telegram);
          break;
        case 'rss':
          parser = new RSSParser(source.id!, source.url, config.parsers.rss);
          break;
        // case 'social':
        //   const { SocialMediaParser } = await import('../parsers/social/SocialMediaParser');
        //   parser = new SocialMediaParser(source.id!, config.parsers.default);
        //   break;
        // case 'podcast':
        //   const { PodcastParser } = await import('../parsers/podcast/PodcastParser');
        //   parser = new PodcastParser(source.id!, config.parsers.default);
        //   break;
        default:
          return {
            success: false,
            error: `Unknown parser type: ${source.type}`,
            sourceName: source.name,
            timestamp: new Date()
          };
      }

      const result = await parser.parse();
      
      return {
        ...result,
        sourceName: source.name,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        sourceName: source.name,
        timestamp: new Date()
      };
    }
  }

  private printSummary(results: ParseResult[]): void {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const totalItems = successful.reduce((sum, r) => sum + (r.data?.length || 0), 0);

    console.log('\n=== PARSING SUMMARY ===');
    console.log(`Successful: ${successful.length}`);
    console.log(`Failed: ${failed.length}`);
    console.log(`Total items parsed: ${totalItems}`);

    if (failed.length > 0) {
      console.log('\nFailed sources:');
      failed.forEach(result => {
        console.log(`- ${result.sourceName}: ${result.error}`);
      });
    }

    console.log('======================\n');
  }
}