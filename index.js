const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

// Извлекаем секретный ключ, который ты укажешь в настройках Render
const GEMINI_API_KEY = process.env.GEMINI_KEY; 

app.post('/ask-gemini', async (req, res) => {
    try {
        const userPrompt = req.body.prompt;
        
        // Ссылка на самую быструю и актуальную модель Gemini 1.5 Flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userPrompt }] }]
            })
        });
        
        const data = await response.json();
        
        // Проверяем, пришел ли успешный ответ от Google
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const reply = data.candidates[0].content.parts[0].text;
            res.json({ text: reply });
        } else {
            res.status(500).json({ error: "Ошибка формата ответа от Gemini", details: data });
        }
        
    } catch (error) {
        console.error("Ошибка на сервере:", error);
        res.status(500).json({ error: "Внутренняя ошибка сервера прокси" });
    }
});

// Запуск сервера на порту, который выделит Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер-мост успешно запущен на порту ${PORT}`);
});
