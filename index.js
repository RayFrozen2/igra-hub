const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors'); // Добавили защиту CORS
const app = express();

app.use(cors()); // Разрешаем запросы от веб-панели
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_KEY; 

app.post('/ask-gemini', async (req, res) => {
    try {
        const userPrompt = req.body.prompt;
        
        // Проверка на пинг от веб-панели
        if (userPrompt === "PING") {
            return res.json({ text: "PONG" });
        }
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userPrompt }] }]
            })
        });
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const reply = data.candidates[0].content.parts[0].text;
            res.json({ text: reply });
        } else {
            res.status(500).json({ error: "Ошибка ответа от Gemini", details: data });
        }
        
    } catch (error) {
        console.error("Ошибка:", error);
        res.status(500).json({ error: "Ошибка прокси сервера" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
