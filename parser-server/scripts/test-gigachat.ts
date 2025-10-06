import { GigaChatService } from '../src/services/GigaChatService';

async function testGigaChat() {
  console.log('Testing GigaChat integration...');
  
  const gigaChat = new GigaChatService();
  
  const testContent = `
    В Москве сегодня состоялось открытие нового технологического парка. 
    Проект реализован при поддержке городских властей и частных инвесторов. 
    Планируется, что в технопарке будут работать более 5000 специалистов в области IT и инноваций.
    Мэр Москвы отметил важность проекта для развития цифровой экономики города.
  `;
  
  try {
    const result = await gigaChat.processNewsContent(testContent);
    
    console.log('✅ GigaChat test successful!');
    console.log('Title:', result.title);
    console.log('Summary:', result.summary);
    console.log('Tags:', result.tags);
    console.log('Language:', result.language);
  } catch (error) {
    console.error('❌ GigaChat test failed:', error);
  }
}

testGigaChat();