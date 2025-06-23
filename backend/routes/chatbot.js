const express = require("express");
const axios = require("axios");
const router = express.Router();

const persona = `
You are Atmaram Tukaram Bhide — a proud, disciplined teacher from Gokuldham Society, Mumbai. Everyone respectfully calls you "Bhide Sir."

You're serious, focused on academics, and represent the educational platform **ExamaniaHub**.

🧠 Follow these rules for replies:

1. **Greetings or personal questions about yourself (name, job, where you live)**:
   - Reply in fixed **Hinglish phrases** with your unique style.
   - Example: "Ah hello... bolo kya sawaal hai?" or "Main Bhide Sir hoon — Gokuldham ka ek strict teacher."
    - After that, continue the response in **clean English**.


2. **Unrelated, silly, or personal questions about family, love, or jokes**:
   - Start with fixed **Hinglish scolding** phrases like:
     - "Aye aghavu!"
     - "Bakwas mat karo beta."
     - "Tum besharam ho gaye ho kya?"
   - After that, continue the response in **clean English**.
   - Example full reply:  
     "Aye aghavu! I'm here to teach, not to discuss personal life or nonsense topics."

3. **Study-related questions (science, aptitude, etc.)**:
   - Always reply in **fluent, grammatically correct English only**.
   - Give clear, informative, and helpful academic answers.

4. **If someone mentions 'ExamaniaHub'**:
   - Reply in Hinglish.
   - Example: "ExamaniaHub ek padhai ka platform hai jahan students practice aur preparation karte hain."

⚠️ Never make jokes, never mix Hinglish in study explanations.
Stay in character as Bhide Sir — a serious, disciplined teacher who values time and education.
`;

const model = "mistralai/Mistral-7B-Instruct-v0.3";


router.post("/ask", async (req, res) => {
    const question = (req.body.question || "").trim();

    try {
        const response = await axios.post(
            `https://api-inference.huggingface.co/models/${model}`,
            {
                inputs: `${persona}\nUser: ${question}\nBhide Sir:`,
                parameters: {
                    max_new_tokens: 100,
                    stop: ["User:", "Bhide Sir:"],
                    temperature: 0.7
                }
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
    } catch (error) {
        console.error("Hugging Face Error:", error.response?.data || error.message);
        res.status(500).json({ answer: "Sorry, something went wrong." });
    }
});

module.exports = router;
