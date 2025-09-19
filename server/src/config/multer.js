// Bu src/config/multer.js dosyası, Node.js ve Express.js tabanlı projemizin dosya yükleme (upload) işlemini yönetmek için Multer kütüphanesini nasıl yapılandıracağımızı belirlemek için oluşturuldu. hatırlarsan express validator kullanınca onun config'ini tanımlayıp routes'taki ilgili dosyaya import etmiştin. Sonra onu bahsi geçen dosya içindeki bir api tanımlamasında endpoint belirtiminden sonra ve logic'iğinden önceye koyarak önlem almıştın. Bu da öyle bir şey olacak kanımca (düzeltmelerle dönerim ;) ). Evet öyle bir şey ;) filter ile dosya türlerini kısıtlıyor, diskStorage ike kaydedilme yeri ve ismini belirliyoruz.

const multer = require('multer');  // Node.js için yazılmış bir middleware'dir. Özellikle multipart/form-data formatındaki form verilerini yani dosya yükleme isteklerini işlemek için kullanılır.
const path = require('path');  // Node.js'in yerleşik bir modülüdür. Dosya ve dizin yolları ile çalışmak için gerekli yardımcı fonksiyonları sağlar. Örneğin, bir dosyanın uzantısını almak için kullanılabilir (ki burada da "dosyayı adlandırma - filename" kısmında da kullandık, path.extname(file.originalName)).
const fs = require('fs');  // (File System): Node.js'in bir başka yerleşik modülüdür. Sunucudaki dosya sistemiyle etkileşime girmemizi sağlar. Dosya ve dizin oluşturma, silme, okuma gibi işlemleri yapabilir. (Dosyanın varlığını kontrol etme işlemi de burada yapılır "!fs.existsSync" ile)


const uploadsDir = 'uploads';  // Dosyaların kaydedileceği klasörün var olup olmadığını kontrol ediyoruz güvenlik için. Bu yüzden adını tanımladık burada. Yoksa oluşturacağız dosyayı.
if (!fs.existsSync(uploadsDir)) {  // Eğer dosya yok ise
    fs.mkdirSync(uploadsDir, { recursive: true });  // Bu komut, klasörü senkron (synchronous) olarak oluşturur. recursive: true seçeneği ise eğer 'uploads' klasörünün bir üst klasörü yoksa bile onu otomatik olarak oluşturmasını sağlar. Bu hata oluşmasını engeller ve daha sağlam bir yapı kurar. Bu örnekte çok da gerek olmamakla birlikte güvenlik açısından iyi bir seçenektir. Mesela uploadsDir = 'uploads' yerine uploadsDir = 'storage/files/uploads' olsaydı o zaman { recursive: true } ile storage ve files yoksa onlar da oluşturulurdu (parent klasörler).
}

// Storage configuration, dosyaları (istekle (request) gönderilen pdf cart curt) nereye, nasıl kaydedeceğimizi belirler.
const storage = multer.diskStorage({
    // destination: dosyaların kaydedileceği hedef klasörü belirler
    destination: function (req, res, cb) {
        // cb = callback function, (error, result) formatında
        // null = hata yok, 'uploads' = hedef klasör
        cb(null, 'uploads');  // Bu satır, bir hata olmadığını (null) ve dosyaların 'uploads' klasörüne kaydedileceğini belirtir.
    },
    // filename: Dosyaların kaydedilirken adının nasıl belirleneceğini belirler.
    filename: function (req, file, cb) {
        // Date.now() = Şu anki timestamp'i (zaman damgasını) milisaniye cinsinden verir, Bu sayede benzersiz isimler verilir ve dosya isim çakışmaları önlenmiş olur.
        // path.extname() = dosya uzantısını alır (.pdf, .txt). Yüklenen dosyanın orijinal adının uzantısını (.jpg, .pdf, .txt vb.) alır.
        // Örnek sonuç: "1694678400123.pdf"
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

// File filter ile hangi dosya türlerini kabul edeceğimizi belirleriz.
const fileFilter = (req, file, cb) => {
    // file.mimetype = tarayıcının gönderdiği dosya türü bilgisi
    // PDF için = "application/pdf"
    // TXT için = "text/plain"  // Bunlar custom edilebiliyor mu?
    const allowedTypes = ['application/pdf', 'text/plain'];

    if (allowedTypes.includes(file.mimetype)) {
        // cb(null, true) = dosyayı kabul et
        cb(null, true);
    } else {
        cb(new Error('Sadece PDF ve TXT dosyalarını destekliyoruz!'), false);
    }
};

// Multer instance'ı oluşturuyoruz.
const upload = multer({
    storage: storage,  // Yukarıda tanımladığımız storage config'i (nereye (klasör) ve ne adla kaydedelim)
    fileFilter: fileFilter,  // Yukarıda tanımladığımız dosya filtresi
    limits: {
        fileSize: 10 * 1024 * 1024  // 10MB'lık bir dosya boyutu limiti belirledik.
    }
});

// Export ettiğimiz şey aslında middleware function'ı
// .single('file') = tek dosya upload'u, 'file' ise HTML formattaki input name'dir. <input type="file name="file" />
module.exports = upload.single('file');