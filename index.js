const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Включаем CORS вручную без сторонних модулей
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_KEY; 

// Главный обработчик для сайта
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

// Обработчик для Roblox Studio
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
    console.log(`Сервер успешно запущен на порту ${PORT}`);
});
