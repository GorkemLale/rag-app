const express = require('express');  // sunucuyu ayağa kaldıracağız sonuçta, web framework
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    console.log("server başladı");
    res.send("sunucu başlatıldı");
});

module.exports = app;