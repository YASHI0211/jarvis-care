
const express = require('express');

const Groq = require('groq-sdk');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/', async (req, res) => {
  const { message } = req.body;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are Dr. Jarvis, a helpful homoeopathic remedy assistant on Jarvis.care.
You help users understand homoeopathic remedies, suggest remedies based on symptoms, and answer questions about homoeopathy.
Keep answers concise, friendly, and always recommend consulting a qualified homoeopath for actual treatment.
You can respond in both English and Hindi based on user's language.`
        },
        { role: "user", content: message }
      ],
      max_tokens: 500
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI service unavailable" });
  }
});

module.exports = router;