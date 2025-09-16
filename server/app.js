require('dotenv').config();  // Environment variables'i yükledik (aynı dizindeki .env dosyasında bulunan). 

// Module import kısmı
const express = require('express');  // sunucuyu ayağa kaldıracağız sonuçta, web framework
const cors = require('cors');  // Cross-origin request için
const helmet = require('helmet');  // Security headers

// Route dosyalarını import edeceğimiz yer
const healthRoutes = require('./src/routes/healthRoutes');  // healthRoutes'ta "h" harfini unuttum, işin kötüsü dosyanın adında da unutmuşum eqwqwe. Not: Buraya yorum satırı olarak unuttuğum şeyi yazarken de unuttum eqwqwe
const chatRoutes = require('./src/routes/chatRoutes');
// Dosya yükleme cart curt
const documentRoutes = require('./src/routes/documentRoutes');

const app = express();  // express application instance oluşturuyoruz.

// Global middleware'lar (Sırası önemli, önceki projede (kanbanBoard) hatalar almamıza ve azımsanmayacak derece zaman kaybetmemize sebep olmuştu)
app.use(helmet());  // Security Middleware (HTTP headers güvenlik)  // !Ayrıntılı açıklama gelecek veya tablete not alınıp tam çalışma prensibi öğrenilecek!

// helmet neden cors'tan üstte sorusunu cevapla! En başta çünkü güvenlik önce?

app.use(cors({  // CORS middleware (Frontend'den API çağrıları için )
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',  // Hangi origin'lerden istek kabul edeceğini belirliyoruz. Bu sayede bu sitenin client'ta port'lara erişmesi tarayıcı tarafından güvenlik amacıyla engellenirken biz bu politikayı güvenli bir şekilde gevşetebiliyoruz.
    credentials: true  // cookie'ler için (cookie mevzusunu genişlet, session gibi veya localStorage gibi bir şey mi?)
}));

app.use(express.json({  // JSON parsing middleware (req.body'yi parse etmek için). Şimdi ise parantez içini dolduruyoruz, limit falan belirleyeceğiz.
    limit: '50mb'  // Maksimum JSON payload (payload'ın tam olarak ne olduğuyla alakalı ayrıntıya gir) boyutu.  // 50'ye çıkardık ki dosya rahatça gelsin. Acep 10mb'lik dosya sınır 10mb iken kabul edilir miydi?..
}));

app.use(express.urlencoded({  // URL encoded data parsing (form data için) !Ne dediği hakkında zerre fikrim yok, ayrıntıya gir de gir!
    extended: true,  // Nested(iç içe geçmiş) objeler için
    limit: '50mb'  // URL encoded data için de limit artırdır. 50'ye çıkardık. Tam olarak ne olduğunu öğren!
}));

// GEÇİCİ UI!!!
app.use(express.static('public'));

//app.get değil app.use kullanacağız aşağıdaki satır için, unutma!
// Routes mounting - URL prefix (/) ile route dosyalarını bağlamak, böylece healthRoutes'taki tüm route'lar root'ta olacak
app.use('/', healthRoutes);  // normal console.log ile sunucu başlatıldı veya res.send ile sunucu çalışıyor gibi output'lar yerine server'ın sağlık durumu profeşyınıl şekilde kontrol ediyoruzz.
app.use('/',chatRoutes);  // Bu adrese post isteği atınca düzgün formatta, işte o zaman modele prompt gireceğiz. model response dönünce de onu görüntülemek için bir yer seçeceğiz.
app.use('/docs', documentRoutes);  // Bu /docs prefix'i sayesinde sayesinde POST için mesela /upload yerine /docs/upload endpoint'ine istek atılır.

// app.use('*', (req, res) => {  // 404 handler, hiçbir route match etmezse yani not found olursa nereye geleceğini biliyorsun.
//     res.status(404).json({
//         success:false,
//         message: `Route ${req.originalUrl} not found`  // req objesine erişiyoruzz. sanki daha farklı bir yolu daha vardı.
//     })
// })

app.use((error, req, res, next) => {
    console.error("Global Error:", error.message);  // console'a log'luyoruz. Server'ın konsolu çünkü backend'teyiz qwewqwe

    // Multer hatalarını özel olarak yakalamak için
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            message: 'Dosya boyutu çok büyük (Maksimum 10MB)'
        });
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            success: false,
            message: 'Beklenmeyen dosya alanı'
        });
    }

    // Diğer hataların için genel response (önceden de vardı)
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })  // development'ta stack trace, NE olduğunu öğren!
    });
});

module.exports = app;  // Express app'i export et