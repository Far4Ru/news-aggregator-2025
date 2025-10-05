import { ParserManager } from '../src/services/ParserManager';

async function manualParse() {
  const parserManager = new ParserManager();
  const args = process.argv.slice(2);
  
  console.log('=== MANUAL PARSING STARTED ===', new Date().toISOString());
  
  if (args.length > 0 && args[0] === '--source') {
    // Парсинг конкретного источника
    const sourceId = args[1];
    if (!sourceId) {
      console.error('Please provide source ID: npm run parse -- --source <source_id>');
      process.exit(1);
    }
    
    console.log(`Parsing single source: ${sourceId}`);
    const result = await parserManager.parseSingleSource(sourceId, true);
    
    if (result.success) {
      console.log(`✓ Successfully parsed ${result.data?.length || 0} items from ${result.sourceName}`);
    } else {
      console.log(`✗ Failed to parse ${result.sourceName}: ${result.error}`);
    }
  } else {
    // Парсинг всех источников
    console.log('Parsing all sources...');
    await parserManager.parseAllSources(true);
  }
  
  console.log('=== MANUAL PARSING COMPLETED ===');
  process.exit(0);
}

manualParse().catch(error => {
  console.error('Manual parsing failed:', error);
  process.exit(1);
});