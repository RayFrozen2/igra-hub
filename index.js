const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Ручная настройка CORS, которая никогда не ломается
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

// ЕДИНСТВЕННЫЙ И ПРАВИЛЬНЫЙ ОБРАБОТЧИК ДЛЯ ВСЕГО
app.post('/ask-gemini', async (req, res) => {
    try {
        const userPrompt = req.body.prompt;
        
        // 1. Перехватываем пинг от нашей панели мгновенно
        if (userPrompt === "PING") {
            return res.json({ text: "PONG" });
        }
        
        // 2. Проверяем, ввел ли ты ключ в настройках Render
        if (!GEMINI_API_KEY) {
            return res.status(500).json({ error: "Ключ GEMINI_KEY не добавлен в настройки Render!" });
        }
        
        // 3. Отправляем запрос в Google
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userPrompt }] }]
            })
        });
        
        const data = await response.json();
        
        // 4. Проверяем корректность ответа от ИИ
        if (data.candidates && data.candidates.length > 0) {
            res.json({ text: data.candidates[0].content.parts[0].text });
        } else {
            console.error("Ошибка от Google API:", data);
            res.status(500).json({ error: "Google AI вернул ошибку ключа или формата", details: data });
        }
        
    } catch (error) {
        console.error("Критическая ошибка:", error);
        res.status(500).json({ error: "Сбой на прокси-сервере" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер-мост успешно запущен на порту ${PORT}`);
});
