const express = require('express');  // sunucuyu ayağa kaldıracağız sonuçta, web framework
const mongoose = require('mongoose');
const app = require('./app');  // Express app'i import ettik. app.js ile bağladık.

const PORT = process.env.PORT || 5000;  // Environment'tan PORT değerini al, yoksa da 5000 kullan

const NODE_ENV = process.env.NODE_ENV || 'development';

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI_CONTAINER || 'mongodb://localhost:27017/rag-app')
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Server'ı başlat ve belirtilen PORT'ta dinlemeye başla
app.listen(PORT, () => {
    console.log("Server'ı dinliyom da bu parça sarmadı bea! ahan da PORT:", PORT);
    console.log(`Bi' çekap yaaptırcem diyosan buyur geyl: http://localhost:${PORT}/health`);  // Test URL'sini belirteyoz.
    console.log("Server'a bi bakem deyosan işte lingi: http://localhost:", PORT);
});

// Şu ikisinin ne olduğunu yala yut!
// Graceful shutdow, Process terminate olduğunda temiz kapanış
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');

    server.close(() => {  // Server'ı kapat
        console.log('Process terminated');
        process.exit(0);  // Clean Exit, Temizz çıkışş
    });
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UnhandledRejection at: ', promise, 'reason: ', reason);

    server.close(() => {  // Server kapanışş
        process.exit(1);  // Error exit
    });
});