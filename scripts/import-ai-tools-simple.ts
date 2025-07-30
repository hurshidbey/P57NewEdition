import * as fs from 'fs';
import * as path from 'path';

// Configuration
const API_URL = 'http://localhost:5001';
const ADMIN_EMAIL = 'hurshidbey@gmail.com';
const ADMIN_PASSWORD = '20031000a'; // From .env.development

// AI tools data from the SQL file
const aiTools = [
  { name: 'ChatGPT', description: 'Matn yozadi va savollarga javob beradi', link: 'https://chat.openai.com' },
  { name: 'Claude', description: 'Yirik hajmli matnlar uchun muloqot va tahlil', link: 'https://claude.ai' },
  { name: 'Midjourney', description: 'So\'zlardan san\'at asari yaratuvchi AI', link: 'https://www.midjourney.com' },
  { name: 'DALL-E', description: 'Matndan bir zumda rasmlar yaratadi', link: 'https://openai.com/dall-e/' },
  { name: 'Stable Diffusion', description: 'Kompyuterda bepul rasm chizuvchi AI', link: 'https://stability.ai' },
  { name: 'Google Gemini', description: 'Google\'ning AI yordamchisi', link: 'https://gemini.google' },
  { name: 'GitHub Copilot', description: 'Kod yozishga yordamchi', link: 'https://github.com/features/copilot' },
  { name: 'Jasper', description: 'Marketing va blog matnlarini yozadi', link: 'https://www.jasper.ai' },
  { name: 'Synthesia', description: 'AI orqali dars yoki reklama videosi tayyorlash', link: 'https://www.synthesia.io' },
  { name: 'Runway Gen-2', description: 'Matn/rasmdan video generatsiya qiladi', link: 'https://runwayml.com' },
  { name: 'Pika Labs', description: 'Promptdan qisqa, animatsion video', link: 'https://pika.art' },
  { name: 'ElevenLabs', description: 'Eng natural sun\'iy ovoz generatori', link: 'https://elevenlabs.io' },
  { name: 'Fireflies', description: 'Meetings uchun avtomatik yozuv va tahlil', link: 'https://fireflies.ai' },
  { name: 'Otter.ai', description: 'Avtomatik transkript va xulosa', link: 'https://otter.ai' },
  { name: 'Notion AI', description: 'Notion\'ga AI yordamchi funksiyasi', link: 'https://www.notion.so/product/ai' },
  { name: 'Tome', description: 'Promptdan chiroyli taqdimot yaratadi', link: 'https://tome.app' },
  { name: 'Canva Magic Design', description: 'Matndan dizayn va slayd generatori', link: 'https://www.canva.com/magic-design/' },
  { name: 'Grammarly AI', description: 'Grammatikani tekshiradi', link: 'https://grammarly.com' },
  { name: 'Quillbot', description: 'Matnni qayta yozadi (paraphrase)', link: 'https://quillbot.com' },
  { name: 'DeepL', description: 'Juda aniq tarjima AI', link: 'https://deepl.com' },
  { name: 'Perplexity', description: 'Real vaqtli javoblar, manbali', link: 'https://www.perplexity.ai' },
  { name: 'Replit Ghostwriter', description: 'Kod yozishda sun\'iy yordam', link: 'https://replit.com/site/ghostwriter' },
  { name: 'Figma AI', description: 'Dizaynda avtomatlashtirish', link: 'https://www.figma.com' },
  { name: 'Framer AI', description: 'Web-saytlarni avtomatik loyihalovchi', link: 'https://www.framer.com' },
  { name: 'Adobe Firefly', description: 'AI yordamida rasm, video yaratish', link: 'https://firefly.adobe.com' },
  { name: 'Microsoft Designer', description: 'Banner, post va dizayn generatsiyasi', link: 'https://designer.microsoft.com' },
  { name: 'DreamStudio', description: 'Stable Diffusion asosida generatsiya', link: 'https://dreamstudio.ai' },
  { name: 'Leonardo AI', description: 'Maxsus san\'at uchun AI', link: 'https://leonardo.ai' },
  { name: 'Upscale Media', description: 'Tasvirlarni tiniqlashtiradi, 8x gacha', link: 'https://www.upscale.media' },
  { name: 'Remove.bg', description: 'Rasm fonini avtomatik o\'chiradi', link: 'https://remove.bg' },
  { name: 'Magic Eraser', description: 'Suratdagi keraksiz elementni o\'chirish', link: 'https://magic-eraser.ai' },
  { name: 'Browse AI', description: 'Vebdan avtomat ma\'lumot yig\'adi', link: 'https://browse.ai' },
  { name: 'Vidyo.ai', description: 'Uzun videoni qisqa kliplarga ajratadi', link: 'https://vidyo.ai' },
  { name: 'OpusClip', description: 'Bir uzun videodan bir nechta short', link: 'https://www.opus.pro' },
  { name: 'Suno AI', description: 'Matndan musiqa/g\'azallar hosil qiladi', link: 'https://suno.ai' },
  { name: 'Udio', description: 'AI orqali vokalli musiqa yaratadi', link: 'https://www.udio.com' },
  { name: 'Soundraw', description: 'Avtomatik royaltifree musiqa generatori', link: 'https://soundraw.io' },
  { name: 'Murf AI', description: 'Sun\'iy intellektli professional voiceover', link: 'https://murf.ai' },
  { name: 'Speechelo', description: 'Soddalashtirilgan matn-to-speech', link: 'https://speechelo.com' },
  { name: 'ChatPDF', description: 'PDF\'ni tahlil qilib, chat shaklida savollarga javob beradi', link: 'https://www.chatpdf.com' },
  { name: 'SciSpace', description: 'Ilmiy maqolalar uchun AI tahlil', link: 'https://scispace.com' },
  { name: 'Elicit', description: 'AI yordamida tezkor adabiyot tahlili', link: 'https://elicit.org' },
  { name: 'Photoroom', description: 'Rasm fonini, logoni, shablonlarni tez tayyorlaydi', link: 'https://www.photoroom.com' },
  { name: 'Voice.ai', description: 'Ovoz klonlash va tovushli kontent generatsiyasi', link: 'https://voice.ai' },
  { name: 'Beautiful.ai', description: 'AI orqali tezkor taqdimot (presentation)', link: 'https://www.beautiful.ai' },
  { name: 'Gamma', description: 'AI-pleyta yangi taqdimot ve hujjat shakli', link: 'https://gamma.app' },
  { name: 'Guru', description: 'AI yordamida bilim bazasi va tezkor qidiruv', link: 'https://www.getguru.com' },
  { name: 'Voiceflow', description: 'Kodsiz chat-bot va support AI agentlar', link: 'https://www.voiceflow.com' },
  { name: 'n8n + AI', description: 'Vizual avtomatlashtirish va RAG + AI integratsiyasi', link: 'https://n8n.io' },
  { name: 'NotebookLM', description: 'Foydalanuvchi ma\'lumotidan sun\'iy izlanish', link: 'https://notebooklm.google' }
];

// Login and get auth token
async function getAuthToken(): Promise<string> {
  try {
    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });

    if (loginRes.ok) {
      const data = await loginRes.json();
      return data.access_token || data.token;
    }

    throw new Error('Failed to login');
  } catch (error) {
    console.error('❌ Login failed:', error);
    throw error;
  }
}

// Import tools via API
async function importTools() {
  try {
    console.log('🔐 Logging in as admin...');
    const token = await getAuthToken();
    
    console.log('🚀 Starting import...');
    let successCount = 0;
    let errorCount = 0;
    
    for (const tool of aiTools) {
      try {
        const res = await fetch(`${API_URL}/api/admin/ai-tools`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(tool)
        });
        
        if (res.ok) {
          console.log(`✅ Imported: ${tool.name}`);
          successCount++;
        } else {
          const error = await res.json();
          console.error(`❌ Failed to import ${tool.name}:`, error);
          errorCount++;
        }
      } catch (error) {
        console.error(`❌ Error importing ${tool.name}:`, error);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 Import completed!`);
    console.log(`✅ Success: ${successCount} tools`);
    console.log(`❌ Errors: ${errorCount} tools`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the import
importTools();