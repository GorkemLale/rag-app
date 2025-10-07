const express = require('express');
const upload = require('../config/multer');
const documentController = require('../controllers/documentController');

const router = express.Router();  // Router instance'ı oluşturarak modüler route yapısı elde ediyorrring

// POST /docs/upload: Dosya yükleme endpoint'i
// upload middleware'i önce çalışır, dosyayı diske kaydeder. Sonra documentController.uploadDocument çalışır. Veritabanına kaydeder...
router.post('/upload', upload, documentController.uploadDocument);

router.get('/list', documentController.listDocuments);

router.get('/list/:id', documentController.getDocumentById);

module.exports = router;