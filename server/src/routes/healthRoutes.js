const express = require('express');  // Express router modülünü import ettim.
const router = express.Router();  // Yeni router instance oluşturdum. Bu route grubu(ayrı bir isimlendirme değil, bildiğimiz grup :D) oluşturmamızı sağlar.

router.get('/health', (req, res) => {  // GET /health endpoint'ini tanımlıyoruz. Yani backend'te localhost:5000/health adresinden sağlık durumunu gözlemlememizi sağlayacak get handler tanımladık.
    const healthData = {  // Health check response objesini oluşturuyoruz. Ayrı oluşturmak yerine direkt res.status(200).json() içine de ekleyebilirdik
        status: 'ok',  // sistem durumu
        timestamp: new Date().toISOString(),  // ISO format zaman damgası
        uptime: process.uptime(),  // Process kaç saniyedir çalışıyor
        environment: process.env.NODE_ENV || 'development'  // Hangi ortamda çalışıyor.
    };

    res.status(200).json(healthData);
});

module.exports = router;  // router'ı export ettik. Bu sayede app.js'te kullanabileceğiz.