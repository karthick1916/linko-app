// server.js
import express from 'express';
import { Ollama } from 'ollama';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());                    // allows localhost:3000 to talk to :5000

const ollama = new Ollama({
  host: 'http://127.0.0.1:11434'    // default Ollama address
});

const MODEL = 'llama3.2:3b';        // lighter & faster than plain llama3

app.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || question.trim() === '') {
      return res.status(400).json({ error: 'Please send a real question' });
    }

    console.log('Question received:', question);

    const response = await ollama.chat({
      model: MODEL,
      messages: [
        {
        role: 'system',
        content: 'You are a helpful assistant. Always answer in 4 lines or fewer. Be concise.'
      },{ role: 'user', content: question }],
      options: { temperature: 0.6 }
    });

    const answer = response.message.content.trim();

    console.log('Answer sent (first 80 chars):', answer.substring(0, 80));

    res.json({ answer });

  } catch (err) {
    console.error('Error:', err.message || err);
    res.status(500).json({
      error: 'Could not get answer from Ollama',
      detail: err.message || 'unknown error'
    });
  }
});

// Quick test endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', model: MODEL });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
  console.log(`Using model: ${MODEL}`);
  console.log('Frontend should be on http://localhost:3000');
});