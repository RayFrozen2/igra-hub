const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_KEY; 

// ОБРАБОТЧИК ДЛЯ САЙТА (принимает запросы на корень сервера)
app.post('/', async (req, res) => {
    try {
        const userPrompt = req.body.prompt;
        
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
            res.json({ text: data.candidates[0].content.parts[0].text });
        } else {
            res.status(500).json({ error: "Ошибка ИИ", details: data });
        }
    } catch (error) {
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// ОБРАБОТЧИК ДЛЯ ROBLOX (оставляем /ask-gemini, чтобы в Roblox Studio ничего не ломалось)
app.post('/ask-gemini', async (req, res) => {
    try {
        const userPrompt = req.body.prompt;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userPrompt }] }]
            })
        });
        
        const data = await response.json();
        res.json({ text: data.candidates[0].content.parts[0].text });
    } catch (error) {
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен`);
});
