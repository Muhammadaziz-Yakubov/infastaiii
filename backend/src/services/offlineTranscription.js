// Agar OpenAI ishlamasa, Vosk offline variant
const vosk = require('vosk');
const fs = require('fs');
const path = require('path');

async function transcribeAudioOffline(audioPath) {
  try {
    // O'zbek modelini yuklab olish kerak
    const modelPath = path.join(__dirname, '../../models/vosk-model-uz');
    
    if (!fs.existsSync(modelPath)) {
      throw new Error('Vosk model topilmadi. Yuklab olish kerak.');
    }
    
    const model = new vosk.Model(modelPath);
    const recognizer = new vosk.Recognizer({model: model, sampleRate: 16000});
    
    const audioData = fs.readFileSync(audioPath);
    recognizer.acceptWaveform(audioData);
    
    const result = recognizer.finalResult();
    return result.text;
  } catch (error) {
    console.error('Vosk error:', error);
    throw error;
  }
}

// Model yuklab olish uchun instructions:
// 1. https://alphacephei.com/vosk/models dan o'zbek modelini yuklang
// 2. backend/models/vosk-model-uz papkasiga joylang
// 3. Internet kerak emas, to'liq offline ishlaydi
