const express = require('express');  // sunucuyu ayağa kaldıracağız sonuçta, web framework
const app = require('./app');


app.listen(5000, () => {
    console.log("Server'ı dinliyom da sarmadı bea!");
});