# Whisper.cpp o'rnatish uchun

# 1. Whisper.cpp kompilyatsiya qilish
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp
make

# 2. O'zbek modelini yuklab olish
./models/download-ggml-model.sh base

# 3. Node.js integratsiya uchun
npm install --save child_process

# 4. Foydalanish
const { exec } = require('child_process');

async function transcribeAudio(audioPath) {
  return new Promise((resolve, reject) => {
    exec(`whisper.cpp -m models/ggml-base.bin -f "${audioPath}" -l uz -otxt`, 
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout.trim());
        }
      }
    );
  });
}

// 5. Bot integratsiyasi
// InFastAIBotService.js da transcribeAudio metodini almashtirish
