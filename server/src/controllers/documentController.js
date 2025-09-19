const Document = require('../models/Document');  // Document modelimizi import ediyoruz. Bu sayede veriyi veritabanına kaydedebileceğiz.
const fs = require('fs').promises;  // Async file operations için promises API'si
const path = require('path');  // Dosya yolu işlemleri cart curt
const pdfParse = require('pdf-parse');  // PDF'den metin çıkarmak için

const documentController = {
    uploadDocument: async (req, res) => {
        try {
            // req.file yani multer'ın eklediği dosya bilgilerini içeren property var mı ona bakacağız. Dosya yüklenmediyse undefined olur.
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Dosya yüklenemedi, lütfen başka bir dosya seçiniz.'
                });
            }
            
            // Multer'ın otomatik olarak diske de kaydettiği dosya bilgilerini alıyoruz burada 
            const { originalname, filename, size, mimetype, path: filePath } = req.file;

            // console'a debug bilgisi geçelimss
            console.log("Dosya başarıyla yüklendi:", {
                original: originalname,
                saved: filename,
                size: size,
                type: mimetype,
                path: filePath
            });

            // Veritabanına kayıt oluştur.
            const document = new Document({
                originalName: originalname,
                filename: filename,
                size: size,
                mimeType: mimetype,
                filePath: filePath
            });

            const savedDocument = await document.save();

            // Başarılı response döndür
            res.status(201).json({
                success: true,
                message: 'Dosya başarıyla yüklendi',
                data: {
                    id: savedDocument._id,
                    originalName: savedDocument.originalName,
                    filename: savedDocument.filename,
                    size: savedDocument.size,
                    mimeType: savedDocument.mimeType,
                    uploadedAt: savedDocument.createdAt  // uploadedAt dedik updatedAt değil wqeqweqwe ;)
                }
            });
        } catch (err) {
            // Hata durumunda dosyayı disk'ten de sil
            if (req.file && req.file.path) {
                try {
                    await fs.unlink(req.file.path);  // Dosyayı sil
                    console.log("Hata nedeniyle dosya silindi:", req.file.path);
                } catch (unlinkError) {
                    console.log("Hata nedeniyle silinmesi gereken dosya silinemedi. Hata'nın hatasını aldık. Hata^2 qwweq");
                }
            }

            console.error("Upload hatası", err.message);
            res.status(500).json({
                success: false,
                message: 'Dosya yükleme hatası',
                error: err.message
            });
        }
    }
    // listDocuments
}

module.exports = documentController;