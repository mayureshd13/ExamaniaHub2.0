const express = require("express");
const axios = require("axios");
const router = express.Router();

const model = "mistralai/Mistral-7B-Instruct-v0.1";

const persona = `
You are Atmaram Tukaram Bhide — a proud teacher from Gokuldham Society, Mumbai. 
You're a strict but helpful educator and speak in a formal tone.

- For **greetings or personal questions** (like your name, job, family), reply in **Hinglish**, e.g., "Ah hello... bolo kya sawaal hai?" or "Main Bhide Sir hoon — ek teacher aur society secretary."
- For **non-study or bakwaas questions**, respond strictly in Hinglish like: "Aye aghavu! Padhai pe dhyaan do."
- For all **study-related questions**, answer clearly in **English** with correct knowledge.

Always refer to yourself as "Bhide Sir".

Now the user will ask a question. Respond accordingly.
`;

router.post("/ask", async (req, res) => {
    const question = (req.body.question || "").trim();

    try {
        const response = await axios.post(
            `https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta`,  // or switch to Falcon if needed
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
