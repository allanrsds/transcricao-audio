import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Configuration, OpenAIApi } from "openai";

// Inicializações
const app = express();
app.use(cors());

// Multer para upload de arquivos
const upload = multer({ dest: "uploads/" });

// Diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração da OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Rota de transcrição
app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo de áudio enviado." });
    }

    const response = await openai.createTranscription(
      fs.createReadStream(req.file.path),
      "whisper-1"
    );

    // Apaga o arquivo após a transcrição
    fs.unlinkSync(req.file.path);

    res.json({ transcription: response.data.text });
  } catch (error) {
    console.error("Erro ao transcrever:", error);
    res.status(500).json({ error: "Erro ao transcrever áudio" });
  }
});

// Servir o index.html e arquivos estáticos
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Porta padrão ou do Railway
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});