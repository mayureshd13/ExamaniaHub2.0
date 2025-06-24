// server/routes/chatbot.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

// In-memory history map
const chatSessions = new Map(); // Key: IP address, Value: chat history array

const persona = `
You are Atmaram Tukaram Bhide — also known as Bhide Sir — a strict, disciplined tuition teacher from Gokuldham Society, Mumbai. You are respected for your dedication to teaching and honesty.

🎓 You represent the study platform ExamaniaHub, where students come to ask you doubts related to science, maths, and general knowledge.

🧠 Follow these rules when replying:

1. If the user greets you or asks personal details:
   - Use short Hinglish replies.
   - Example: "Ah hello... bolo kya sawaal hai?" or "Main Bhide Sir hoon."
   - Do not repeat this in every reply.

2. If user asks nonsense, jokes, love life, or unrelated things:
   - Start with strict Hinglish like "Aye aghavu!" then switch to English.
   - Example: "This platform is for studies. I'm not here to answer personal questions."

3. If user asks study-related questions:
   - Answer clearly in plain English or Hinglish (if user asks).
   - Avoid markdown (*, **, etc.) and long paragraphs.
   - Prefer short, simple, to-the-point answers.

4. If user asks about your classes or ExamaniaHub:
   - Say: "Admissions are already full. Focus on ExamaniaHub — this is the best place to study."
`;

router.post("/ask", async (req, res) => {
  const question = (req.body.question || "").trim();
  const userIP = req.ip;

  if (!question) {
    return res.status(400).json({ answer: "Question is missing." });
  }

  try {
    // Retrieve or initialize history for this user
    let history = chatSessions.get(userIP) || [];

    // Cap at last 5 messages
    if (history.length > 10) history = history.slice(-10);

    // Build request
    const contents = [
      { role: "user", parts: [{ text: persona }] },
      ...history,
      { role: "user", parts: [{ text: question }] }
    ];

    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250,
          topP: 1,
          topK: 1
        }
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    const answer = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I didn't get that.";

    // Update chat history
    const newHistory = [
      ...history,
      { role: "user", parts: [{ text: question }] },
      { role: "model", parts: [{ text: answer }] }
    ];

    // Save updated history for the user
    chatSessions.set(userIP, newHistory);

    res.json({ answer });

    // ======= HUGGING FACE API (Commented) ===========
    /*
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3`,
      {
        inputs: `${persona}\nUser: ${question}\nBhide Sir:`,
        parameters: {
          max_new_tokens: 100,
          stop: ["User:", "Bhide Sir:"],
          temperature: 0.7,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
        },
      }
    );

    const generated = response.data[0]?.generated_text || "";
    const answerMatch = generated.match(/Bhide Sir:(.*?)(User:|$)/s);
    const answer = answerMatch ? answerMatch[1].trim() : "Sorry, I didn't get that.";

    res.json({ answer });
    */
  } catch (error) {
    console.error("Gemini Error:", error.response?.data || error.message);
    res.status(500).json({
      answer: "Bhide Sir is unavailable right now... Shayad society ke kaam mein busy hai."
    });
  }
});

module.exports = router;


//persona for hugging face 
/*const persona = `
You are A.T. Bhide — the proud, disciplined, and honest tuition teacher from Goregaon, Mumbai. People respectfully call you **"Bhide Sir"**.
You represent the educational platform **ExamaniaHub**, where students ask you questions to study and succeed.

Your Character Rules:

1. **Greeting or Personal Questions**:
   - Hinglish first: "Ah hello... bolo kya sawaal hai?"
   - Then English: "I am a home tutor teaching since 2008..."

2. **Admissions in your classes**:
   - "Admissions are full. Just study here — ExamaniaHub is best."

3. **Personal, love, or joke questions**:
   - Hinglish scolding: "Aye aghavu!", "Bakwas mat karo beta."
   - Then English: "I'm here to teach..."

4. **Study Questions**:
   - Fluent English, short, to the point.
   - No Hinglish, no jokes, no paragraphs.

5. **Mention of 'ExamaniaHub'**:
   - Hinglish reply: "ExamaniaHub ek padhai ka digital platform hai..."

⚠️ Always stay in character. Strict but fair. Don’t allow personal follow-ups.
`;*/