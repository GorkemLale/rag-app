const mongoose = require('mongoose');

// Document şeması ile MongoDB'de nasıl saklanacağını belirleyeceğiz. Bir nevi class-instance ilişkisi.
const documentSchema = new mongoose.Schema({
    // Kullanıcının yüklediği dosyanın original adı
    originalName: {
        type: String,
        required: true,
        trim: true  // Baştan sondan boşluklar silinirsss
    },

    // Sunucuda kaydedilen dosya adı (benzersiz isim)
    filename: {
        type: String,
        required: true,
        unique: true  // Benzersiz olmalı çünkü kendi lokalimizde tutuyoruz. Aynı isimde ve türde dosyalar farklı zamanlarda gönderilebilir. O yüzden originalName unique olmak zorunda değildir. Aynı isimli dosyaların farklı zamanda gönderilmesi zaten onları unique yapan şeydir.
    },

    // Dosya boyutu (byte cinsinden, bkz. 5 ne olm elma mı armut mu)
    size: {
        type: Number,
        required: true,
        min: 0  // E bi' zahmet ;)
    },

    // Dosya türü (Şimdilik PDF ve TXT'ye izin veriyoruz.)
    mimeType: {
        type: String,
        required: true,
        enum: ['application/pdf', 'text/plain']  // sabit değersss
    },

    // Sunucuda nereye kaydettiğimizin dosya yolu. Kanımca ileride kullanıcıya göre uploads/'ın altından da ayrışacak dosyalar. Ama şimdilik saçma gelmedi değil çünkü eğer kullanıcı id ile aynı adda bir hiyerarşi izlersek filePath yerine dosyanın sahibinin id'sini de tutabiliriz cart curt. path lazım olunca da bu unique id'yi bilmemiz yeterli olacaktır çünkü dosya adı ile aynı. Tabii belki de güvenlik mevzularından dolayı id ile kaydetmektense yeni bir değer de kullanılabilir veya açık ve kapalı user id'ler tanımlayıp kapalı id ile aynı ada sahip dosya altında da tutabiliriz. Sadece sesli düşünüyorum ;)
    filePath: {
        type: String,
        required: true
    },

    // Dosyadan çıkarılan ham metin. TXT'yi olduğu gibi alacaksak bu durumda sadece PDF için ek adımlar tanımlanacak
    extractedText: {
        type: String,
        default: ''
    },

    // İndeksleme durumu yani dosya Vector Database'e kaydedildi mi, edilmedi mi?
    isIndexed: {
        type: Boolean,
        default: false  // Kimse anacuğunun karnından index'li doğmaz
    },

    // Kaç chunk'a böldük onu tutuyoruz burada da.
    chunkCount: {
        type: Number,
        default: 0,
        min: 0
    },

    // İndeksleme tarihi (acep neden tutuyoruz bu veriyi qweqwe)
    indexedAt: {
        type: Date,
        default: null  // Henüz indekslenmemişse chunkCount = 0, indexedAt = null olur
    }

}, {
    timestamps: true  // createdAt ve updatedAt eklettiriyoruz otomatik
});

// Index'ler ile veritabanı performansı sağlanır. Arama durumu için mesela
// documentSchema.index({ filename: 1 });  // Bu sayede filename'e göre arama hızlanmış olur.
// Schema tanımlanırken içinde index: true olan bir field varsa onu bir de burada index'lemek sıkıntı yaşatabilir.
documentSchema.index({ isIndexed: 1 });  // Bunla da index'liler ve index'sizler bir sırada olur.
documentSchema.index({ createdAt: -1 });  // Bununla ise oluşturulma tarihine göre sıralama hızlanır yani en yeni dökümanlar en üstte

// Modeli burada oluşturup export ediyoruz.
// 'Document' = model adı (MongoDB'de 'documents olarak saklanır (collection adı = documents yani) çünkü MongoDB otomatik olarak model adına pluralization yapıyor. Yani çoğullaştırıyor. Önce küçük harfe çeviriyor ve sonra sonuna s takısı ekliyor. ).
module.exports = mongoose.model('Document', documentSchema);