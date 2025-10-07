const Document = require('../models/Document');  // Document modelimizi import ediyoruz. Bu sayede veriyi veritabanına kaydedebileceğiz.
const fs = require('fs').promises;  // Async file operations için promises API'si
const path = require('path');  // Dosya yolu işlemleri cart curt
const pdfParse = require('pdf-parse');  // PDF'den metin çıkarmak için
const chromaDBService = require('../services/ChromaDBService');

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
                    id: savedDocument._id,  // bunu kullanıcıya dönmek doğru mu? Evet, galiba index'leme işleminde veya dosyayı isteme işleminde bununla istek atıyoruz. Aslında gerekli sınırlar çizildiğinde kullanıcı ne yapabilir ki? Düşününce sıkıntı olmaz gibi geldi.
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
    },
    listDocuments: async(req, res) => {
        try {
            const documents = await Document.find()
                .select('originalName filename size mimeType isIndexed chunkCount createdAt')
                .sort({ createdAt: -1 })
                .limit(50);

            const stats = {
                total: documents.length,
                indexed: documents.filter(doc => doc.isIndexed).length
                // pending: documents.length.filter(doc => !doc.isIndexed).length  // Bu key'in value'su için (1. key) - (2. key) yapamaz mıyız? yani total dosyalar ya index'lenmiştir ya da index'lenmemiştir. total sayıya ek olarak ikisinden birini bilince diğeri de gelir. İşe yara mı dediğim? Yaptık, daha performanslı
            };
            stats.pending = stats.total - stats.indexed;

            res.status(200).json({
                success: true,
                message: (documents.length === 0) ? "Dökümanlar başarıyla döndürüldü" : 'Henüz herhangi bir döküman yüklenmemiş',
                data: documents,
                stats: stats
            });
        } catch (err) {
            console.log("listDocuments logic'inde bir sorun oluştu!", err.message);
            
            res.status(500).json({
                success: false,
                message: "Yüklü dosyaları listelerken bir sorun oluştu.",
                error: (process.env.NODE_ENV === "development") ? err.message : undefined
            })
        }
    },
    getDocumentById: async (req, res) => {
        try {
            const { id } = req.params;
            const document = await Document.findById(id);

            if (!document) {
                console.log("İlgili ID'ye ait döküman bulunamadı!");
                
                return res.status(404).json({
                    success: false,
                    message: "İlgili ID'ye ait döküman bulunamadı!"
                });
            }

            res.status(200).json({
                success: true,
                message: "Document başarıyla döndürüldü :)",
                data: document
            })

        } catch (err) {
            console.log("getDocumentById logic'inde bir sorun var.", err.message);

            res.status(500).json({
                success: false,
                message: "Aradığınız döküman ile alakalı bir sorun var.",
                error: process.env.NODE_ENV === "development" ? err.message : undefined
            });
        }
    },
    extractTextFromFile: async (filePath, mimeType) => {
        try {
            if(mimeType === 'text/plain') {
                const textContent = await fs.readFile(filePath, 'utf8');
                return textContent;
            } else if (mimeType === 'application/pdf') {
                const pdfBuffer = await fs.readFile(filePath);  // neden utf-8 gelmedi burada?

                const pdfData = await pdfParse(pdfBuffer);
                
                return pdfData.text;
            } else {
                throw new Error('Desteklenmeyen dosya türü: ', mimeType);  // muhtemelen catch'(err)'a atıyor bizi ve içindeki string ile de bize bir sebep veriyor.
            }
        } catch (err) {
            console.error("Metin çıkarma hatası", err.message);
            throw err;
        }
    },
    indexDocument: async (req, res) => {
        try {
            const { documentId } = req.body;

            if (!documentId) {
                return res.status(400).json({
                    success: false,
                    message: 'Döküman ID gerekli'
                });
            }

            const document = await Document.findById(documentId);

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Döküman bulunamadı'
                });
            }

            if (document.isIndexed) {
                return res.status(400).json({
                    success: false,
                    message: 'Ne ahşap adamsın olm, döküman zaten indekslenmiş yau weqqwe ;)'
                });
            }

            console.log("İndeksleme ", document.originalName, " adlı dosya için başlıyor");
            
            const extractedText = await this.extractTextFromFile(
                document.filePath,
                document.mimeType
            );
    
            if (!extractedText || extractedText.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Dosyadan metin çıkarılamadı, metanetli olunuz. '
                });
            }

            const cleanedText = extractedText
                .replace(/\s+/g,' ')
                .replace(/\n+/g, '\n')
                .trim();

            const chunks = documentController.createChunks(cleanedText);  // Aşağıda tanımlayacağız birazdan
            
            console.log("ChromaDB'ye kaydediliyor...");
            const vectorResult = await chromaDBService.addChunks(
                chunks,
                documentId.toString(),
                document.originalName
            );

            console.log("Vektör database'e kaydedildi, evet 'ö' ile");

            await Document.findByIdAndUpdate(documentId, {
                extactedText: cleanedText,
                isIndexed: true,
                chunkCount: chunks.length,
                indexedAt: new Date()
            });
        } catch (err) {
            console.log("indexDocument logic'inde bir sorun oluştu.", err.message);
            
            res.status(500).json({
                success: false,
                message: "Dosyanız index'lenirken bir hata oluştu.",
                error: process.env.NODE_ENV === "developmnet" ? err.message : undefined
            });
        }
    },
    createChunks: (text, chunkSize = 1000, overlap = 150) => {
        const chunks = [];
        let startIndex = 0;

        while (startIndex < text.length) {
            let endIndex = startIndex + chunkSize;
            
            if (endIndex >= text.length) {
                endIndex = text.length;
            } else {
                const lastSpaceIndex = text.lastIndexOf(' ', endIndex);

                if (lastSpaceIndex > startIndex + chunkSize * 0.8) {
                    endIndex = lastSpaceIndex;
                }
            }

            const chunk = text.substring(startIndex, endIndex).trim();
            
            if (chunk.length > 0) {
                chunks.push({
                    text: chunk,
                    startIndex: startIndex,
                    endIndex: endIndex,
                    length: chunk.length
                });
            }

            startIndex = endIndex - overlap;

            if (startIndex >= text.length - overlap) {
                break;
            }
        }
        console.log("Chunking Tamamlandı: ", chunks.length, " chunk oluşturuldu");
        console.log("Chunk boyutları", chunks.map(c => c.length));

        return chunks;
    },
    deleteDocument: async(req, res) => {
        try {
            const { id } = req.params;

            const document = await Document.findById(id);

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Bu ID\'ye ait dosya bulunamadı, kimliğini bilmediğin herife ne yapabilirsin ki???'
                });
            }

            try {
                await fs.unlink(document.filePath);  // unlink'e de her babayiğit yazamaz unlike diye qewweq
                console.log("Fiziksel dosya silindi: ", document.filePath);
            } catch (fileError) {
                console.log('Fiziksel dosya silinemedi: ', fileError.message);
            }

            // Bir de veritabanından silelim
            await Document.findByIdAndDelete(id);

            await chromaDBService.deleteDocumentChunks(id.toString());

            res.status(200).json({
                success: true,
                message: "Döküman başarıyla silindi",
                data: {
                    deletedDocument: document.originalName  // Hangi dosyanın silindiğini direkt deletedDocument diye belirtmek yerine neden data'nın altında belirttik?
                }
            })
        } catch (err) {
            console.log("deleteDocument logic'inde bir sorun oluştu.", err.message);

            res.status(500).json({
                success: false,
                message: "Dosyanızı silerken bir sorun oluştu.",
                error: process.env.NODE_ENV === "development" ? err.message : undefined
            });
        }
    }
}

module.exports = documentController;