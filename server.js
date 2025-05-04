import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import pdf from "pdf-parse";
import OpenAI from "openai";
import axios from "axios";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let manualText = "";

const manualChunks = [];
const manualChunksEmbeddings = [];

app.use(express.static(path.join(__dirname, "public")));

const pdfPath = path.join(__dirname, "public", "MANUAL PRIM AJUTOR.pdf");

// pt aplicatie
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered with scope: ', registration.scope);
      })
      .catch((error) => {
        console.log('Service Worker registration failed: ', error);
      });
  });
}

// citirea manualului pdf
try {
  const pdfDataBuffer = fs.readFileSync(pdfPath);
  pdf(pdfDataBuffer).then((data) => {
    manualText = data.text;

    const chunkSize = 2000;

    for (let i = 0; i < manualText.length; i += chunkSize) {
      manualChunks.push(manualText.slice(i, i + chunkSize));
    }
  });
}
catch (err) {
  console.error("Failed to read manual: " + err);
}

// reprezentarea chunk-urilor extrase sub forma de vectori
for (const chunk of manualChunks) {
  try {
    const res = await client.embeddings.create({
      model: "text-embedding-ada-002",
      input: chunk,
    });
    manualChunksEmbeddings.push(res.data[0].embedding);
  }
  catch (err) {
    console.error("Failed to create embedding for chunk: " + err);
    manualChunksEmbeddings.push([]);
  }
}

// functie ajutatoare pentru calcularea similaritatii dintre doi vectori
function cosineSimilarity(vecA, vecB) {
  // produsul cu punct dintre cei doi vectori
  const dot = vecA.reduce((sum, a, i) => sum + a * (vecB[i] || 0), 0);

  // modulul vectorului A
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));

  // modulul vectorului B
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  // evitarea impartirii la 0
  if (magA === 0 || magB === 0) return 0;

  return dot / (magA * magB);
}

async function getRelevantChunks(query) {
  try {
    const res = await client.embeddings.create({
      model: "text-embedding-ada-002",
      input: query,
    });

    const queryEmbedding = res.data[0].embedding;

    const scoredChunks = manualChunks.map((chunk, idx) => {
      const score = cosineSimilarity(queryEmbedding, manualChunksEmbeddings[idx]);
      return {chunk, score};
    });

    scoredChunks.sort((a, b) => b.score - a.score);

    const topChunks = scoredChunks.slice(0, 3).map(item => item.chunk);

    return topChunks.join("\n\n---\n\n");
  }
  catch (err) {
    console.error("Error getting relevant chunks: " + err);
    return "";
  }
}

app.get("/", async (req, res) => {
  res.send("Server is running!");
});

// app.listen(PORT, async () => {
//   console.log("Server starting...");
//   await getNgrokUrl();
//   console.log("Server running at http://localhost:" + PORT);
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/get-url", async (req, res) => {
  try {
    const publicUrl = (process.env.API_URL || "http://localhost") + PORT;
    res.json({ url: publicUrl });
  } catch (error) {
    console.error("Failed to retrieve the Ngrok URL", error);
    res.status(500).json({ error: "Failed to retrieve the URL" });
  }
});

let msgHistory = [
  {
    role: "system",
    content: "Esti un asistent care raspunde doar la intrebari din domeniul primului ajutor si refuza sa raspunda intr-o maniera politicoasa la intrebari irelevante.",
  }
];

app.post("/ask", async (req, res) => {
  const userMessage = req.body.message;

  msgHistory.push({ role: "user", content: userMessage });

  const context = getRelevantChunks(userMessage);

  if (context) {
    msgHistory.push({role: "system", content: "Informatii extrase din manual:" + context,});
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: msgHistory,
      max_tokens: 500,
    });
  
    let ans = response.choices[0].message.content;
  
    res.json({ reply: ans });
  
    msgHistory.push({role: "assistant", content: ans});
  }
  catch (error) {
    console.warn("Failed to send user message.");
    res.status(500).json({error: "Failed to send user message."});
  }
});

async function getNgrokUrl() {
  try {
    const res = await axios.get("http://127.0.0.1:4040/api/tunnels");
    const publicUrl = res.data.tunnels[0].public_url;

    const ENV_PATH = ".env";
    const ENV_KEY = "REACT_APP_API_URL";

    let env = "";
    if (fs.existsSync(ENV_PATH)) {
      env = fs.readFileSync(ENV_PATH, "utf8");
    }

    const lines = env.split('\n');
    let found = false;

    const newLines = lines.map((line) => {
      if (line.startsWith(`${ENV_KEY}=`)) {
        found = true;
        return `${ENV_KEY}=${publicUrl}`;
      }
      return line;
    });

    if (!found) {
      newLines.push(`${ENV_KEY}=${publicUrl}`);
    }

    fs.writeFileSync(ENV_PATH, newLines.join('\n'), "utf8");
    console.log(`Updated .env with ${ENV_KEY}=${publicUrl}`);
  }
  catch (error) {
    console.error("Failed to get Ngrok URL or update .env", error);
  }
}
